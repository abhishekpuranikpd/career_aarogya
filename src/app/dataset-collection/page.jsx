"use client";

import { useState, useEffect } from "react";
import { PlusIcon, TrashIcon, ArrowUpTrayIcon, UserGroupIcon } from "@heroicons/react/24/outline";

const generateEmptyRows = (count) => {
    return Array.from({ length: count }).map(() => ({
        id: crypto.randomUUID(), // More robust than Date.now() for rapid loops
        firstName: "", 
        middleName: "", 
        lastName: "", 
        gender: "Male"
    }));
};

export default function DatasetCollection() {
    // Start with 12 persons by default
    const [rows, setRows] = useState(generateEmptyRows(12));
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [totalCount, setTotalCount] = useState(0);

    const fetchCount = async () => {
        try {
            const res = await fetch("/api/test-dataset");
            const data = await res.json();
            if (res.ok) setTotalCount(data.count);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchCount();
    }, []);

    const addRow = () => {
        setRows([...rows, ...generateEmptyRows(1)]);
    };

    const addBatch = () => {
        setRows([...rows, ...generateEmptyRows(12)]);
    };

    const removeRow = (id) => {
        if (rows.length > 1) {
            setRows(rows.filter(row => row.id !== id));
        }
    };

    const handleChange = (id, field, value) => {
        setRows(rows.map(row => row.id === id ? { ...row, [field]: value } : row));
    };

    const handleSubmit = async () => {
        // Validation: Only submit rows that have at least a first name or last name
        const filledRows = rows.filter(row => row.firstName.trim() !== "" || row.lastName.trim() !== "");
        
        if (filledRows.length === 0) {
            setMessage({ type: 'error', text: "Please fill out at least one person's details." });
            return;
        }

        const isValid = filledRows.every(row => row.firstName.trim() !== "" && row.lastName.trim() !== "");
        if (!isValid) {
            setMessage({ type: 'error', text: "First Name and Last Name are required for filled rows." });
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            const res = await fetch("/api/test-dataset", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(filledRows.map(({ id, ...data }) => data))
            });

            const data = await res.json();
            
            if (res.ok) {
                setMessage({ type: 'success', text: `Successfully saved ${data.count} records!` });
                setRows(generateEmptyRows(12)); // Reset to 12 empty rows
                fetchCount();
            } else {
                setMessage({ type: 'error', text: data.error || "Failed to save dataset." });
            }
        } catch (error) {
            setMessage({ type: 'error', text: "An error occurred while submitting." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    
                    <div className="bg-primary px-4 sm:px-8 py-6 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <h1 className="text-2xl font-bold">Dataset Collection</h1>
                            <p className="text-blue-100 text-sm mt-1">
                                Average people are adding 50-100 names at a time! Add as many as you want below.
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                            <div className="text-center bg-white/10 px-4 py-2 rounded-lg border border-white/20 grow md:grow-0">
                                <div className="text-2xl font-bold leading-none">{totalCount}</div>
                                <div className="text-[10px] text-blue-200 uppercase tracking-widest font-bold mt-1">Total Saved</div>
                            </div>
                            <div className="flex gap-2 w-full md:w-auto">
                                <button 
                                    onClick={addRow}
                                    className="flex-1 md:flex-none flex justify-center items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition text-sm"
                                >
                                    <PlusIcon className="w-5 h-5" /> Add Next Person
                                </button>
                                <button 
                                    onClick={addBatch}
                                    className="flex-1 md:flex-none flex justify-center items-center gap-2 bg-white text-primary px-4 py-2 rounded-lg font-bold hover:bg-gray-100 transition shadow-sm text-sm"
                                >
                                    <UserGroupIcon className="w-5 h-5" /> +12 Persons
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 sm:p-8">
                        {message && (
                            <div className={`mb-6 p-4 rounded-lg font-medium ${message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                                {message.text}
                            </div>
                        )}

                        {/* Mobile view uses a stack of cards, Desktop uses a table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[800px]">
                                <thead>
                                    <tr className="border-b-2 border-gray-200">
                                        <th className="py-3 px-4 text-gray-600 font-semibold w-12 text-center">#</th>
                                        <th className="py-3 px-4 text-gray-600 font-semibold">First Name *</th>
                                        <th className="py-3 px-4 text-gray-600 font-semibold">Middle Name</th>
                                        <th className="py-3 px-4 text-gray-600 font-semibold">Last Name *</th>
                                        <th className="py-3 px-4 text-gray-600 font-semibold">Gender *</th>
                                        <th className="py-3 px-4 text-gray-600 font-semibold w-16 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map((row, index) => (
                                        <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50 group">
                                            <td className="py-3 px-4 text-center text-gray-400 font-medium">{index + 1}</td>
                                            <td className="py-3 px-4">
                                                <input type="text" value={row.firstName} onChange={(e) => handleChange(row.id, 'firstName', e.target.value)} className="w-full p-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none" placeholder="Ramesh" />
                                            </td>
                                            <td className="py-3 px-4">
                                                <input type="text" value={row.middleName} onChange={(e) => handleChange(row.id, 'middleName', e.target.value)} className="w-full p-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none" placeholder="Suresh (Optional)" />
                                            </td>
                                            <td className="py-3 px-4">
                                                <input type="text" value={row.lastName} onChange={(e) => handleChange(row.id, 'lastName', e.target.value)} className="w-full p-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none" placeholder="Patil" />
                                            </td>
                                            <td className="py-3 px-4">
                                                <select value={row.gender} onChange={(e) => handleChange(row.id, 'gender', e.target.value)} className="w-full p-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white">
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <button onClick={() => removeRow(row.id)} disabled={rows.length === 1} className={`p-2 rounded-lg transition-colors ${rows.length === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-red-500 hover:bg-red-50 hover:text-red-700'}`}>
                                                    <TrashIcon className="w-5 h-5 mx-auto" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile view: Stacked Cards */}
                        <div className="md:hidden space-y-4">
                            {rows.map((row, index) => (
                                <div key={row.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm relative">
                                    <div className="flex justify-between items-center mb-3 border-b border-gray-100 pb-2">
                                        <span className="font-bold text-gray-500">Person #{index + 1}</span>
                                        <button onClick={() => removeRow(row.id)} disabled={rows.length === 1} className={`p-1.5 rounded-md ${rows.length === 1 ? 'text-gray-300' : 'text-red-500 hover:bg-red-50'}`}>
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">First Name *</label>
                                            <input type="text" value={row.firstName} onChange={(e) => handleChange(row.id, 'firstName', e.target.value)} className="w-full mt-1 p-2 border border-gray-200 rounded-md focus:ring-primary outline-none" placeholder="Ramesh" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Middle Name</label>
                                            <input type="text" value={row.middleName} onChange={(e) => handleChange(row.id, 'middleName', e.target.value)} className="w-full mt-1 p-2 border border-gray-200 rounded-md focus:ring-primary outline-none" placeholder="Suresh (Optional)" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Last Name *</label>
                                            <input type="text" value={row.lastName} onChange={(e) => handleChange(row.id, 'lastName', e.target.value)} className="w-full mt-1 p-2 border border-gray-200 rounded-md focus:ring-primary outline-none" placeholder="Patil" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Gender *</label>
                                            <select value={row.gender} onChange={(e) => handleChange(row.id, 'gender', e.target.value)} className="w-full mt-1 p-2 border border-gray-200 rounded-md focus:ring-primary outline-none bg-white">
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 flex flex-col sm:flex-row justify-end items-center gap-4 border-t border-gray-100 pt-6">
                            <span className="text-gray-500 font-medium text-center">{rows.filter(r => r.firstName.trim() || r.lastName.trim()).length} filled row(s) ready</span>
                            <button 
                                onClick={handleSubmit}
                                disabled={loading}
                                className="w-full sm:w-auto flex justify-center items-center gap-2 bg-primary hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-70"
                            >
                                {loading ? 'Submitting...' : (
                                    <>
                                        <ArrowUpTrayIcon className="w-5 h-5" /> Submit All Data
                                    </>
                                )}
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
