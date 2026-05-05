import React, { useState, useEffect, useMemo } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from '../../partials/Sidebar';
import Header from '../../partials/Header';
import { AiOutlinePlus } from 'react-icons/ai';
import { FiChevronDown, FiChevronUp, FiTrash2 } from 'react-icons/fi';
import Swal from 'sweetalert2';
import axios from 'axios'; 

// --- Configuration ---
const API_BASE = "https://alhamarahomesbd.com/alhamra-backend/public/api/v1/accounting";

// --- Sub-Components for Table Rows ---

/**
 * Renders an individual journal line (debit or credit).
 */
const JournalLineRow = ({ line }) => (
    // Use a lighter gray background for line details for visual nesting
    <tr className="bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700">
        {/* Empty cell for visual alignment under Transaction ID */}
        <td className="w-12"></td> 
        <td className="px-6 py-2 text-sm text-gray-700 dark:text-gray-300 font-mono">
            {line.account.code}
        </td>
        <td className="px-6 py-2 text-sm text-gray-800 dark:text-gray-200">
            {line.account.name}
        </td>
        <td className="px-6 py-2 text-sm text-right font-semibold font-mono text-blue-600 dark:text-blue-400">
            {/* Debit amount formatted to 2 decimal places */}
            {Number(line.debit) > 0 ? Number(line.debit).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ''}
        </td>
        <td className="px-6 py-2 text-sm text-right font-semibold font-mono text-green-600 dark:text-green-400">
            {/* Credit amount formatted to 2 decimal places */}
            {Number(line.credit) > 0 ? Number(line.credit).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ''}
        </td>
        {/* Empty cell for alignment with Action/Total */}
        <td className="w-12"></td> 
    </tr>
);

/**
 * Renders the main journal entry row, including totals and collapsible lines.
 */
const JournalRow = ({ journal }) => {
    const [isOpen, setIsOpen] = useState(false);

    // Calculate totals for the main row display
    const totals = useMemo(() => {
        const totalDebit = journal.lines.reduce((sum, line) => sum + Number(line.debit), 0);
        const totalCredit = journal.lines.reduce((sum, line) => sum + Number(line.credit), 0);
        return { totalDebit, totalCredit };
    }, [journal.lines]);

    return (
        <>
            {/* Main journal entry row */}
            <tr className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition duration-150 border-b border-gray-300 dark:border-gray-600 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
                <td className="pl-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-700 dark:text-blue-400">
                    <div className="flex items-center">
                        {/* Toggle Icon */}
                        {isOpen ? <FiChevronUp size={20} className="mr-3 text-gray-500" /> : <FiChevronDown size={20} className="mr-3 text-gray-500" />}
                        {journal.tx_id}
                    </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200 font-medium">{journal.description}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(journal.occurred_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                
                {/* Total Debit and Credit columns */}
                <td className="px-6 py-4 text-sm text-right font-bold font-mono text-blue-800 dark:text-blue-300">
                    {totals.totalDebit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-4 text-sm text-right font-bold font-mono text-green-800 dark:text-green-300">
                    {totals.totalCredit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                {/* Action Column for icons like Delete/Edit */}
                <td className="px-6 py-4 text-center">
                    <button onClick={(e) => { e.stopPropagation(); /* handleDelete(journal.id) */ }} className="text-red-400 hover:text-red-600 transition">
                        <FiTrash2 size={16} />
                    </button>
                </td>
            </tr>
            
            {/* Render lines if open */}
            {isOpen && (
                <>
                    {/* Header for the lines section - visually separates totals from lines */}
                    <tr className="bg-gray-100 dark:bg-gray-700/70">
                        <td colSpan="2" className="pl-12 pr-6 py-1 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Account Code</td>
                        <td className="px-6 py-1 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Account Name</td>
                        <td className="px-6 py-1 text-xs font-semibold uppercase text-right text-gray-500 dark:text-gray-400">Debit</td>
                        <td className="px-6 py-1 text-xs font-semibold uppercase text-right text-gray-500 dark:text-gray-400">Credit</td>
                        <td></td>
                    </tr>
                    {journal.lines.map(line => <JournalLineRow key={line.id} line={line} />)}
                </>
            )}
        </>
    );
};

// --- Main Component ---

const Journallist = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [journals, setJournals] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(false);

    const token = localStorage.getItem("authToken");

    // Fetch Journals
    const fetchJournals = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE}/journals`, {
                headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
            });
            setJournals(res.data.data || []);
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Failed to fetch journals.";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Fetch Chart of Accounts
    const fetchAccounts = async () => {
        if (!token) return;
        try {
            const res = await axios.get(`${API_BASE}/accounts`, {
                headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
            });
            // Handle array response or object with data property
            setAccounts(Array.isArray(res.data) ? res.data : res.data.data || []); 
        } catch (error) {
            toast.warn("Could not fetch accounts for form.");
        }
    };

    useEffect(() => {
        fetchJournals();
        fetchAccounts();
    }, [token]);


    /**
     * Handles the complex logic and rendering for the Journal Creation modal using SweetAlert (Swal).
     */
    const openJournalModal = () => {
        // Initialize lines with one empty line, pre-selected with the first account
        let lines = [{ account_code: accounts[0]?.code || '', debit: 0, credit: 0 }];

        // Helper to generate <option> tags for the select dropdown
        const getAccountOptions = (selectedCode) => accounts.map(acc => 
            `<option value="${acc.code}" ${acc.code === selectedCode ? 'selected' : ''}>${acc.code} - ${acc.name} (${acc.type})</option>`
        ).join('');

        // Helper to update the total Debit/Credit and Balance status text
        const updateTotals = () => {
            const lineElements = document.querySelectorAll('#journal-lines-container .journal-line');
            let totalDebit = 0;
            let totalCredit = 0;

            lineElements.forEach(lineEl => {
                const debit = parseFloat(lineEl.querySelector('.debit-input').value) || 0;
                const credit = parseFloat(lineEl.querySelector('.credit-input').value) || 0;
                totalDebit += debit;
                totalCredit += credit;
            });

            const diff = totalDebit - totalCredit;
            const balanceText = Math.abs(diff) < 0.01 // Use tolerance for floating point comparison
                ? `<span class="text-green-600 font-bold">BALANCED</span>`
                : `<span class="text-red-600 font-bold">UNBALANCED: ${diff.toFixed(2)}</span>`;

            // Update DOM elements for display
            document.getElementById('total-debit').textContent = totalDebit.toFixed(2);
            document.getElementById('total-credit').textContent = totalCredit.toFixed(2);
            document.getElementById('balance-status').innerHTML = balanceText;
        };
        
        // Helper to read current values from the DOM and update the `lines` array
        const updateLinesFromDOM = () => {
            const lineElements = document.querySelectorAll('#journal-lines-container .journal-line');
            const updatedLines = Array.from(lineElements).map(lineEl => {
                return {
                    account_code: lineEl.querySelector('.account-select').value,
                    debit: parseFloat(lineEl.querySelector('.debit-input').value) || 0,
                    credit: parseFloat(lineEl.querySelector('.credit-input').value) || 0,
                };
            });
            // Sync the local `lines` variable with the state from the UI
            lines = updatedLines;
        };

        // Helper to re-render all journal lines
        const renderLines = () => {
             const container = document.getElementById('journal-lines-container');
             container.innerHTML = lines.map((line, index) => getLineHTML(line, index)).join('');
             updateTotals(); // Update totals after rendering new lines
        };
        
        // Helper to generate HTML for a single journal line row (Improved Styling)
        const getLineHTML = (line, index) => `
            <div class="journal-line grid grid-cols-12 gap-3 items-center mb-3 p-3 border border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-700/50" data-index="${index}">
                <div class="col-span-6">
                    <select class="swal2-select account-select w-full !my-0 !py-2.5 !px-4 border border-gray-400 rounded-lg focus:ring-[#1976D2] focus:border-[#1976D2] shadow-sm text-gray-800">
                        ${getAccountOptions(line.account_code)}
                    </select>
                </div>
                <div class="col-span-3">
                    <input type="number" placeholder="Debit" class="swal2-input debit-input w-full !my-0 !py-2.5 !px-4 font-mono text-right border border-gray-400 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm text-blue-700 font-semibold" value="${line.debit > 0 ? line.debit : ''}" required step="0.01" min="0">
                </div>
                <div class="col-span-2">
                    <input type="number" placeholder="Credit" class="swal2-input credit-input w-full !my-0 !py-2.5 !px-4 font-mono text-right border border-gray-400 rounded-lg focus:ring-green-500 focus:border-green-500 shadow-sm text-green-700 font-semibold" value="${line.credit > 0 ? line.credit : ''}" required step="0.01" min="0">
                </div>
                <div class="col-span-1 text-center">
                    <button type="button" class="remove-line-btn text-red-500 hover:text-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed p-1 rounded-full hover:bg-red-50" ${lines.length <= 1 ? 'disabled' : ''}>
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 pointer-events-none" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 6h6v10H7V6z" clip-rule="evenodd" /></svg>
                    </button>
                </div>
            </div>
        `;

        Swal.fire({
            title: 'Create New Journal Entry 📝',
            html: `
                <div class="p-4 text-left space-y-5">
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description <span class="text-red-500">*</span></label>
                            <input id="journal-description" class="swal2-input w-full !m-0 !py-2.5 !px-4 border border-gray-400 rounded-lg shadow-inner text-gray-800" placeholder="e.g., Office supplies purchase">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date <span class="text-red-500">*</span></label>
                            <input id="journal-date" type="date" class="swal2-input w-full !m-0 !py-2.5 !px-4 border border-gray-400 rounded-lg shadow-inner text-gray-800" value="${new Date().toISOString().split('T')[0]}">
                        </div>
                    </div>
                    
                    <h4 class="text-xl font-extrabold text-gray-900 dark:text-gray-100 mt-5 mb-2 border-t pt-4">Journal Lines</h4>
                    
                    <div class="grid grid-cols-12 gap-3 items-center text-xs font-bold uppercase text-gray-600 dark:text-gray-400 pb-2 border-b border-gray-300">
                        <div class="col-span-6">Account</div>
                        <div class="col-span-3 text-right">Debit Amount</div>
                        <div class="col-span-2 text-right">Credit Amount</div>
                        <div class="col-span-1 text-center"></div>
                    </div>

                    <div id="journal-lines-container"></div>
                    
                    <button type="button" id="add-line-btn" class="flex items-center text-base font-semibold text-[#1976D2] hover:text-blue-600 transition mt-3">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg> Add another line
                    </button>

                    <div class="flex justify-between items-center text-lg font-extrabold mt-5 pt-4 border-t-2 border-gray-400 dark:border-gray-600">
                        <p>Total Balance Status:</p>
                        <p id="balance-status" class="font-mono text-xl"></p>
                    </div>
                    <div class="grid grid-cols-12 gap-3 text-sm font-semibold text-gray-800 dark:text-gray-200">
                        <div class="col-span-6"></div>
                        <div class="col-span-3 text-right text-blue-800 dark:text-blue-300">Total Debit: <span id="total-debit" class="font-extrabold font-mono">0.00</span></div>
                        <div class="col-span-2 text-right text-green-800 dark:text-green-300">Total Credit: <span id="total-credit" class="font-extrabold font-mono">0.00</span></div>
                        <div class="col-span-1"></div>
                    </div>
                </div>
            `,
            width: '850px', 
            showCancelButton: true,
            confirmButtonText: 'Create Journal',
            confirmButtonColor: '#1976D2',
            customClass: {
                popup: 'shadow-2xl rounded-xl',
                confirmButton: 'px-6 py-2',
            },
            didOpen: () => {
                const container = document.getElementById('journal-lines-container');
                renderLines(); // Initial render and total update

                // Event listeners for interactivity and validation
                document.getElementById('add-line-btn').addEventListener('click', () => {
                    updateLinesFromDOM(); // Read current values before adding a new line
                    lines.push({ account_code: accounts[0]?.code || '', debit: 0, credit: 0 });
                    renderLines();
                });

                container.addEventListener('input', updateTotals); 
                container.addEventListener('change', updateTotals);

                container.addEventListener('click', e => {
                    if (e.target.closest('.remove-line-btn')) {
                        const lineEl = e.target.closest('.journal-line');
                        const index = parseInt(lineEl.dataset.index, 10);
                        if (lines.length > 1) {
                            updateLinesFromDOM(); // Read current values before removing a line
                            lines.splice(index, 1);
                            renderLines(); 
                        } else {
                            toast.warn("You must have at least one journal line.");
                        }
                    }
                });
            },
            preConfirm: () => {
                const description = document.getElementById('journal-description').value;
                const occurred_at = document.getElementById('journal-date').value;
                if (!description || !occurred_at) {
                    Swal.showValidationMessage('Description and Date are required.');
                    return false;
                }

                const lineElements = document.querySelectorAll('.journal-line');
                const journalLines = Array.from(lineElements).map(lineEl => {
                    return {
                        account_code: lineEl.querySelector('.account-select').value,
                        debit: parseFloat(lineEl.querySelector('.debit-input').value) || 0,
                        credit: parseFloat(lineEl.querySelector('.credit-input').value) || 0,
                    };
                });

                const totalDebit = journalLines.reduce((sum, line) => sum + line.debit, 0);
                const totalCredit = journalLines.reduce((sum, line) => sum + line.credit, 0);

                if (Math.abs(totalDebit - totalCredit) > 0.01) {
                    Swal.showValidationMessage(`Debits (${totalDebit.toFixed(2)}) and Credits (${totalCredit.toFixed(2)}) do not balance.`);
                    return false;
                }
                
                if (totalDebit === 0 && totalCredit === 0) {
                     Swal.showValidationMessage('Journal entry must have a non-zero transaction amount.');
                    return false;
                }

                return { description, occurred_at: `${occurred_at} 12:00:00`, lines: journalLines };
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                const payload = {
                    ...result.value,
                    meta: { source: 'manual' }
                };

                Swal.showLoading();
                try {
                    const res = await axios.post(`${API_BASE}/journals`, payload, {
                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
                    });
                    
                    toast.success('Journal created successfully!');
                    fetchJournals();
                    Swal.close();
                } catch (error) {
                    const errorMessage = error.response?.data?.errors 
                        ? Object.values(error.response.data.errors).flat().join(' | ') 
                        : (error.response?.data?.message || 'Failed to create journal.');
                    
                    toast.error(`Creation Error: ${errorMessage}`);
                    Swal.hideLoading(); 
                }
            }
        });
    };
    
    // --- Render ---

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
            {/* Assuming Sidebar and Header components are available */}
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                <main className="grow p-6">
                    <div className="w-full bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl">
                        <ToastContainer position="top-right" autoClose={3000} theme="colored" />
                        <div className="flex justify-between items-center mb-6 border-b pb-4 border-gray-200 dark:border-gray-700">
                            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">General Ledger Journal Entries</h2>
                            <button onClick={openJournalModal} className="flex items-center bg-[#1976D2] text-white font-medium px-5 py-2.5 rounded-xl shadow-lg hover:bg-blue-600 transition transform hover:scale-105">
                                <AiOutlinePlus size={20} className="mr-2" /> New Entry
                            </button>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-4 border-b-4 border-[#1976D2]"></div></div>
                        ) : (
                            <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-xl shadow-md">
                                <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-600">
                                    <thead className="bg-gray-100 dark:bg-gray-900">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Transaction ID</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Description</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Total Debit</th>
                                            <th className="px-6 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Total Credit</th>
                                            <th className="px-6 py-3 text-center text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {journals.length > 0 ? journals.map(j => <JournalRow key={j.id} journal={j} />) : <tr><td colSpan="6" className="text-center py-12 text-gray-500 dark:text-gray-400">No journal entries found.</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Journallist;