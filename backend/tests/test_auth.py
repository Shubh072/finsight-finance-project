import pytest
from backend.app import create_app
from backend.app.config.settings import Config

class TestConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"  # fast mocked local test DB

@pytest.fixture
def client():
    app = create_app(TestConfig)
    with app.test_client() as client:
        yield client

def test_system_health_endpoint(client):
    """Test standard load balancer query response parameters"""
    response = client.get("/api/health")
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data["success"] is True
    assert "FinSight Enterprise Engine" in json_data["message"]
