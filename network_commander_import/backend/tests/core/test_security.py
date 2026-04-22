import pytest
from network_commander_import.backend.core.security import LogWatcher, SECURITY_LOG_BUFFER

@pytest.fixture
def watcher():
    SECURITY_LOG_BUFFER.clear()
    return LogWatcher()

def test_parse_line_failed_password(watcher):
    line = "Feb 28 10:10:10 hostname sshd[1234]: Failed password for invalid user admin from 192.168.1.100 port 50000 ssh2"
    watcher._parse_line(line)

    assert len(SECURITY_LOG_BUFFER) == 1
    event = SECURITY_LOG_BUFFER[0]
    assert event["type"] == "auth_fail"
    assert "Failed login for 'admin' from 192.168.1.100" in event["message"]
    assert event["severity"] == "warning"
    assert event["ip"] == "192.168.1.100"

def test_parse_line_failed_password_valid_user(watcher):
    line = "Feb 28 10:10:10 hostname sshd[1234]: Failed password for root from 10.0.0.5 port 50000 ssh2"
    watcher._parse_line(line)

    assert len(SECURITY_LOG_BUFFER) == 1
    event = SECURITY_LOG_BUFFER[0]
    assert event["type"] == "auth_fail"
    assert "Failed login for 'root' from 10.0.0.5" in event["message"]
    assert event["severity"] == "warning"
    assert event["ip"] == "10.0.0.5"

def test_parse_line_accepted_password(watcher):
    line = "Feb 28 10:10:10 hostname sshd[1234]: Accepted password for myuser from 172.16.0.1 port 50000 ssh2"
    watcher._parse_line(line)

    assert len(SECURITY_LOG_BUFFER) == 1
    event = SECURITY_LOG_BUFFER[0]
    assert event["type"] == "auth_success"
    assert "Successful login for 'myuser' from 172.16.0.1" in event["message"]
    assert event["severity"] == "success"
    assert event["ip"] == "172.16.0.1"

def test_parse_line_sudo_command(watcher):
    line = "Feb 28 10:10:10 hostname sudo: myuser : TTY=pts/0 ; PWD=/home/myuser ; USER=root ; COMMAND=/bin/ls"
    watcher._parse_line(line)

    assert len(SECURITY_LOG_BUFFER) == 1
    event = SECURITY_LOG_BUFFER[0]
    assert event["type"] == "sudo"
    assert "Sudo Command: /bin/ls" in event["message"]
    assert event["severity"] == "info"
    assert event["ip"] is None

def test_parse_line_unrelated_log(watcher):
    line = "Feb 28 10:10:10 hostname systemd[1]: Started Service."
    watcher._parse_line(line)

    assert len(SECURITY_LOG_BUFFER) == 0
