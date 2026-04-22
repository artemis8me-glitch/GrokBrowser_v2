import pytest
from unittest.mock import patch, MagicMock
from core.remote import SSHClientManager
import paramiko

@patch('paramiko.SSHClient')
def test_connect_success(mock_sshclient):
    # Setup mock
    mock_client_instance = MagicMock()
    mock_sshclient.return_value = mock_client_instance

    # Create manager and connect
    manager = SSHClientManager()
    result = manager.connect("10.0.0.1", "admin", "password", None, 22)

    # Assert
    assert result == {"status": "connected", "host": "10.0.0.1"}
    mock_client_instance.connect.assert_called_once_with(
        "10.0.0.1", port=22, username="admin", password="password", key_filename=None
    )
    assert manager.current_host == "10.0.0.1"
    assert manager.client == mock_client_instance

@patch('paramiko.SSHClient')
def test_connect_failure(mock_sshclient):
    # Setup mock to raise exception
    mock_client_instance = MagicMock()
    mock_sshclient.return_value = mock_client_instance
    mock_client_instance.connect.side_effect = Exception("Connection timed out")

    # Create manager and connect
    manager = SSHClientManager()
    result = manager.connect("10.0.0.1", "admin", "password", None, 22)

    # Assert
    assert result == {"status": "error", "message": "Connection timed out"}
    mock_client_instance.connect.assert_called_once_with(
        "10.0.0.1", port=22, username="admin", password="password", key_filename=None
    )
    # The current host should not be set
    assert manager.current_host is None
