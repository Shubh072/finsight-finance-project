from flask import Flask, jsonify
from flask_cors import CORS
from backend.app.config.settings import Config
from backend.app.models.base import db
from backend.app.routes.auth_routes import auth_bp
from backend.app.routes.expense_routes import expense_bp
from backend.app.routes.dashboard_routes import dashboard_bp

def create_app(config_class=Config) -> Flask:
    """Enterprise application factory creating configured Flask server instances"""
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Enable safe Cross-Origin Resource Sharing (CORS)
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Bind databases
    db.init_app(app)

    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(expense_bp)
    app.register_blueprint(dashboard_bp)

    # Centralized global JSON error handlers
    @app.errorhandler(404)
    def handle_not_found(err):
        return jsonify({
            "success": False,
            "message": "The requested API resource was not found",
            "errors": [str(err)],
            "status": 404
        }), 404

    @app.errorhandler(500)
    def handle_internal_server_error(err):
        return jsonify({
            "success": False,
            "message": "An internal server error occurred",
            "errors": [str(err)],
            "status": 500
        }), 500

    @app.route("/api/health", methods=["GET"])
    def system_health_check():
        """Fast load balancer and ingress health check endpoint"""
        return jsonify({
            "success": True,
            "message": "FinSight Enterprise Engine is fully online",
            "status": 200,
            "data": {
                "database_binding": True,
                "api_key_loaded": bool(Config.GEMINI_API_KEY)
            }
        }), 200

    return app
