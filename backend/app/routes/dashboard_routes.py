from flask import Blueprint, request, g, jsonify
from backend.app.middleware.auth_middleware import token_required
from backend.app.utils.responses import api_success, api_error
from backend.app.models.expense import ExpenseTransaction
from backend.app.models.investment import Investment
from backend.app.models.goal import FinancialGoal
from backend.app.models.report import DashboardSummary
from backend.app.ai.gemini import GeminiAIService
from backend.app.models.base import db
from decimal import Decimal

dashboard_bp = Blueprint("dashboard", __name__, url_prefix="/api/dashboard")

@dashboard_bp.route("/summary", methods=["GET"])
@token_required
def get_summary():
    """Fetch user's cached summary card values (top-level tiles)"""
    try:
        user_id = g.current_user.user_id
        
        summary = DashboardSummary.query.filter_by(user_id=user_id).first()
        if not summary:
            # First time setup default values
            summary = DashboardSummary(
                user_id=user_id,
                total_balance=Decimal("0.00"),
                total_income=Decimal("0.00"),
                total_expenses=Decimal("0.00"),
                net_worth=Decimal("0.00"),
                investment_value=Decimal("0.00"),
                financial_health_score=78
            )
            db.session.add(summary)
            db.session.commit()

        # Gather real totals to enrich output
        investments_val = db.session.query(db.func.sum(Investment.quantity * Investment.current_price)).filter_by(user_id=user_id, status="active").scalar() or 0.0
        active_goals = FinancialGoal.query.filter_by(user_id=user_id, status="on_track").all()
        recent_expenses = ExpenseTransaction.query.filter_by(user_id=user_id, deleted_at=None).order_by(ExpenseTransaction.transaction_date.desc()).limit(5).all()

        return api_success(
            data={
                "kpis": {
                    "total_balance": float(summary.total_balance),
                    "total_income": float(summary.total_income),
                    "total_expenses": float(summary.total_expenses),
                    "net_worth": float(summary.net_worth) + float(investments_val),
                    "investment_value": float(investments_val),
                    "health_score": summary.financial_health_score or 82
                },
                "goals_progress": [
                    {
                        "goal_id": g.goal_id,
                        "name": g.goal_name,
                        "progress": float(g.progress_percent),
                        "saved_amount": float(g.saved_amount),
                        "target_amount": float(g.target_amount)
                    } for g in active_goals[:3]
                ],
                "recent_activity": [
                    {
                        "expense_id": e.expense_id,
                        "amount": float(e.amount),
                        "category": e.category.category_name if e.category else "General",
                        "date": e.transaction_date.isoformat(),
                        "notes": e.notes
                    } for e in recent_expenses
                ]
            },
            message="Dashboard summary compiled"
        )
    except Exception as e:
        return api_error(f"Failed to generate dashboard overview: {str(e)}", status=500)

@dashboard_bp.route("/ai-insights", methods=["POST"])
@token_required
def request_ai_advisory():
    """Trigger the Gemini Core Advisory engine to run live analysis and returns structured insights"""
    try:
        user = g.current_user
        profile = {
            "occupation": user.profile.occupation if user.profile else None,
            "monthly_income": float(user.profile.monthly_income) if user.profile else 0.0,
            "risk_tolerance": user.profile.risk_tolerance if user.profile else "moderate",
            "country": user.profile.country if user.profile else "India"
        }

        # Gather raw transactions
        expenses = ExpenseTransaction.query.filter_by(user_id=user.user_id, deleted_at=None).limit(20).all()
        expenses_payload = [{"amount": float(e.amount), "date": e.transaction_date.isoformat(), "category": e.category.category_name if e.category else "Misc"} for e in expenses]

        # Gather portfolio holding
        holdings = Investment.query.filter_by(user_id=user.user_id, status="active").all()
        holdings_payload = [{"asset": h.asset_name, "type": h.asset_type, "value": float(h.current_value)} for h in holdings]

        # Gather goals
        goals = FinancialGoal.query.filter_by(user_id=user.user_id).all()
        goals_payload = [{"name": gl.goal_name, "target": float(gl.target_amount), "saved": float(gl.saved_amount)} for gl in goals]

        # Call live Gemini layer
        insights = GeminiAIService.generate_structured_insights(profile, expenses_payload, holdings_payload, goals_payload)
        
        return api_success(
            data=insights,
            message="AI Advisory analysis completed successfully"
        )
    except Exception as e:
        return api_error(f"Advisory intelligence compilation failed: {str(e)}", status=500)
