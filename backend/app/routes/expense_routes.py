from flask import Blueprint, request, g
from backend.app.models.expense import ExpenseCategory, ExpenseTransaction
from backend.app.middleware.auth_middleware import token_required
from backend.app.utils.responses import api_success, api_error
from backend.app.models.base import db
from datetime import datetime
from decimal import Decimal

expense_bp = Blueprint("expenses", __name__, url_prefix="/api/expenses")

@expense_bp.route("", methods=["GET"])
@token_required
def get_expenses():
    """Retrieve filtered, sorted, paginated expenses for current authenticated user"""
    try:
        user_id = g.current_user.user_id
        
        # Parse query params
        page = int(request.args.get("page", 1))
        limit = int(request.args.get("limit", 25))
        category_id = request.args.get("category_id")
        start_date = request.args.get("start_date")
        end_date = request.args.get("end_date")
        min_amount = request.args.get("min_amount")
        max_amount = request.args.get("max_amount")
        sort_by = request.args.get("sort_by", "transaction_date")
        order = request.args.get("order", "desc")

        # Build query
        query = ExpenseTransaction.query.filter_by(user_id=user_id, deleted_at=None)

        if category_id:
            query = query.filter(ExpenseTransaction.category_id == int(category_id))
        if start_date:
            query = query.filter(ExpenseTransaction.transaction_date >= datetime.strptime(start_date, "%Y-%m-%d").date())
        if end_date:
            query = query.filter(ExpenseTransaction.transaction_date <= datetime.strptime(end_date, "%Y-%m-%d").date())
        if min_amount:
            query = query.filter(ExpenseTransaction.amount >= Decimal(min_amount))
        if max_amount:
            query = query.filter(ExpenseTransaction.amount <= Decimal(max_amount))

        # Sort and order
        sort_col = getattr(ExpenseTransaction, sort_by, ExpenseTransaction.transaction_date)
        if order.lower() == "desc":
            query = query.order_by(sort_col.desc())
        else:
            query = query.order_by(sort_col.asc())

        # Pagination
        total = query.count()
        expenses = query.offset((page - 1) * limit).limit(limit).all()

        results = []
        for exp in expenses:
            results.append({
                "expense_id": exp.expense_id,
                "amount": float(exp.amount),
                "category": {
                    "category_id": exp.category_id,
                    "category_name": exp.category.category_name if exp.category else "Uncategorized"
                },
                "payment_mode": exp.payment_mode,
                "transaction_date": exp.transaction_date.isoformat(),
                "notes": exp.notes
            })

        return api_success(
            data={
                "expenses": results,
                "page": page,
                "limit": limit,
                "total": total
            },
            message="Expenses fetched successfully"
        )
    except Exception as e:
        return api_error(f"Failed to fetch expenses: {str(e)}", status=500)

@expense_bp.route("", methods=["POST"])
@token_required
def create_expense():
    """Create a new expense entry in the ledger"""
    try:
        user_id = g.current_user.user_id
        body = request.get_json() or {}

        # Validate mandatory parameters
        if not body.get("category_id") or not body.get("amount") or not body.get("transaction_date"):
            return api_error("Missing mandatory category_id, amount or date parameters", status=400)

        # Confirm category exists
        cat = ExpenseCategory.query.filter_by(category_id=body["category_id"]).first()
        if not cat:
            return api_error("Expense category not found", status=404)

        expense = ExpenseTransaction(
            user_id=user_id,
            category_id=int(body["category_id"]),
            amount=Decimal(str(body["amount"])),
            payment_mode=body.get("payment_mode", "other"),
            transaction_date=datetime.strptime(body["transaction_date"], "%Y-%m-%d").date(),
            notes=body.get("notes")
        )
        db.session.add(expense)
        db.session.commit()

        return api_success(
            data={
                "expense_id": expense.expense_id,
                "amount": float(expense.amount),
                "transaction_date": expense.transaction_date.isoformat()
            },
            message="Expense recorded successfully",
            status=201
        )
    except Exception as e:
        return api_error(f"Failed to record transaction: {str(e)}", status=500)

@expense_bp.route("/<int:expense_id>", methods=["DELETE"])
@token_required
def delete_expense(expense_id):
    """Soft-delete an expense item for audit safety"""
    try:
        user_id = g.current_user.user_id
        expense = ExpenseTransaction.query.filter_by(expense_id=expense_id, user_id=user_id, deleted_at=None).first()
        if not expense:
            return api_error("Expense record not found", status=404)

        expense.soft_delete(operator_id=user_id)
        return api_success(message="Expense deleted successfully")
    except Exception as e:
        return api_error(f"Error deleting expense: {str(e)}", status=500)
