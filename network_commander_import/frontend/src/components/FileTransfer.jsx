import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { api } from '../lib/api';
import { FileUp, FileDown, RefreshCw } from 'lucide-react';

export default function FileTransfer() {
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);

    const refreshFiles = async () => {
        try {
            const res = await api.get('/files/list');
            setFiles(res.files || []);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        refreshFiles();
    }, []);

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            await api.upload('/files/upload', file);
            await refreshFiles();
        } catch (e) {
            alert('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleDownload = (filename) => {
        window.location.href = `/api/files/download/${filename}`;
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileUp className="text-yellow-400" /> File Transfer
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex gap-4 mb-6">
                    <div className="relative">
                        <input
                            type="file"
                            onChange={handleUpload}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <Button isLoading={uploading}>
                            <FileUp className="mr-2 h-4 w-4" /> Upload File
                        </Button>
                    </div>
                    <Button variant="secondary" onClick={refreshFiles}>
                        <RefreshCw className="mr-2 h-4 w-4" /> Refresh
                    </Button>
                </div>

                <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-400">Remote Files</h4>
                    <div className="bg-black/30 rounded-lg p-2 max-h-[200px] overflow-auto">
                        {files.map((f) => (
                            <div key={f} className="flex items-center justify-between p-2 hover:bg-white/5 rounded transition-colors group">
                                <span className="text-sm">{f}</span>
                                <Button size="sm" variant="ghost" onClick={() => handleDownload(f)}>
                                    <FileDown className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                        {files.length === 0 && <span className="text-gray-600 text-sm p-2">No files found</span>}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
