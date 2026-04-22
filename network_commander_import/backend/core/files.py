import os
import shutil
from typing import List, Dict, Any
from fastapi import UploadFile

class FileManager:
    UPLOAD_DIR = "/home/devlopjake/Terminal/NetworkCommander/uploads"

    @staticmethod
    def ensure_upload_dir():
        if not os.path.exists(FileManager.UPLOAD_DIR):
            os.makedirs(FileManager.UPLOAD_DIR)

    @staticmethod
    async def save_upload(file: UploadFile) -> Dict[str, Any]:
        FileManager.ensure_upload_dir()
        file_path = os.path.join(FileManager.UPLOAD_DIR, file.filename)
        try:
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            return {"success": True, "filename": file.filename, "path": file_path}
        except Exception as e:
            return {"success": False, "error": str(e)}

    @staticmethod
    def list_files() -> List[str]:
        FileManager.ensure_upload_dir()
        return os.listdir(FileManager.UPLOAD_DIR)

    @staticmethod
    def get_file_path(filename: str) -> str:
        return os.path.join(FileManager.UPLOAD_DIR, filename)
