import { useState, useEffect } from 'react';
import api from '../utils/api';

function DailyReport() {
    const [reportData, setReportData] = useState(null);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // Aaj ki date default
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchReport();
    }, [date]); // when Date change report will refresh hogi

    const fetchReport = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get(`/reports/daily-summary?date=${date}`);
            if (response.data.success) {
                setReportData(response.data.data);
            }
        } catch (err) {
            setError('Failed to fetch report data');
            console.error("Report fetch failed", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mt-8 bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Team Daily Summary</h3>
                <input 
                    type="date" 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {error && <div className="text-red-500 mb-4">{error}</div>}

            {loading ? (
                <div className="text-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-500">Generating Report...</p>
                </div>
            ) : reportData ? (
                <>
                {/* Detailed Breakdown Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-100 text-gray-600 uppercase text-[10px] font-bold">
                                <tr>
                                    <th className="px-4 py-3">Employee</th>
                                    <th className="px-4 py-3">Visits</th>
                                    <th className="px-4 py-3">Unique Clients</th>
                                    <th className="px-4 py-3">Work Hours</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.employee_breakdown?.length > 0 ? (
                                    reportData.employee_breakdown.map((emp) => (
                                        <tr key={emp.employee_id} className="border-b hover:bg-gray-50">
                                            <td className="px-4 py-3 font-medium">{emp.employee_name}</td>
                                            <td className="px-4 py-3">{emp.total_checkins}</td>
                                            <td className="px-4 py-3">{emp.unique_clients_visited}</td>
                                            <td className="px-4 py-3">
                                                {/* --- BUG FIX: Table hours toFixed crash safe check --- */}
                                                <span className={emp.total_hours > 0 ? "text-green-600 font-bold" : "text-gray-400"}>
                                                    {emp.total_hours ? emp.total_hours.toFixed(1) : '0.0'}h
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="text-center py-4 text-gray-500">No data for this date</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            ) : (
                <p className="text-center text-gray-500">Select a date to view report</p>
            )}
        </div>
    );
}

export default DailyReport;