import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Bot, Code } from 'lucide-react';

export default function AgentAccess() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Bot className="w-5 h-5 text-green-400" /> Agent API Access</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-gray-400 text-sm">
                        Network Commander exposes a full REST API for your AI agents to interact with the system programmatically.
                    </p>
                    <div className="bg-black/50 p-4 rounded border border-gray-800 font-mono text-xs text-green-400 space-y-2">
                        <p># Base Endpoint</p>
                        <p>http://{window.location.hostname}:5260/api</p>
                        <br />
                        <p># Example: Scan Ports</p>
                        <p>POST /api/check-port {"{ 'host': '192.168.1.1', 'port': 80 }"}</p>
                        <br />
                        <p># Example: Remote SSH</p>
                        <p>POST /api/remote/command {"{ 'command': 'ls -la' }"}</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Code className="w-5 h-5 text-blue-400" /> Documentation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-gray-400 text-sm">
                        Full Swagger UI documentation is available for agent training and schema discovery.
                    </p>
                    <a
                        href="/docs"
                        target="_blank"
                        className="block w-full text-center bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 p-3 rounded transition-colors"
                    >
                        Open API Documentation (/docs)
                    </a>

                    <div className="mt-4 p-4 border border-gray-800 rounded bg-gray-900/50">
                        <h4 className="text-white font-medium mb-2 text-sm">Agent Instructions</h4>
                        <ul className="list-disc pl-4 text-xs text-gray-400 space-y-1">
                            <li>All endpoints return JSON responses.</li>
                            <li>Use <code className="text-blue-300">/api/system/connections</code> to see what ports are busy.</li>
                            <li>Use <code className="text-blue-300">/api/remote/...</code> to control other devices.</li>
                            <li>Authentication is currently open for local convenience.</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
