import React, { useEffect, useState, useCallback, useMemo } from "react";
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css'; 

// Importing icons from react-icons (Font Awesome)
import { 
    FaPlusCircle, FaTimesCircle, FaTrashAlt, FaCog, FaChartLine, 
    FaEdit, FaSpinner, FaCubes, FaUserTie, FaMinusCircle, FaMoneyBillWave,
    FaAsterisk, FaDollarSign 
} from 'react-icons/fa';
import { v4 as uuidv4 } from 'uuid'; 

// --- 1. CONSTANTS and UTILITIES ---
const DEFAULT_SIMPLE_STRUCTURE = { down_payment: "", installment: "" };

const INCENTIVE_DESIGNATIONS = ['MO', 'MM', 'DGM', 'GM', 'PD', 'ED', 'DMD', 'DIR'];
const DEFAULT_INCENTIVE_STRUCTURE = Object.fromEntries(
    INCENTIVE_DESIGNATIONS.map(d => [d, ""])
);

// Define all special key types here (using snake_case for consistency with API key names)
const COMPLEX_PERCENTAGE_KEYS = ['development_bonus', 'development_bonusssssss'];
const FIXED_AMOUNT_KEYS = ['monthly_incentives']; 
const DIRECTOR_FUND_KEYS = ['director_fund']; // Kept for reference, but logic will be more dynamic
const MONTHLY_INCENTIVE_KEYS = ['monthly_incentive_settings']; 
const DIRECTOR_RANK_KEYS = ['director_rank_settings'];

const DIRECTOR_FUND_DESIGNATIONS = ['PD', 'ED', 'DMD', 'DIR'];
const DEFAULT_DIRECTOR_FUND_STRUCTURE = Object.fromEntries(
    DIRECTOR_FUND_DESIGNATIONS.map(d => [d, { percentage: "", frequency: d === 'DIR' ? '' : 'yearly', per_person_share: d === 'DIR' ? '' : undefined }])
);
const DEFAULT_MONTHLY_INCENTIVE_STRUCTURE = { percentage: "", max_levels: "" };
const DEFAULT_DIRECTOR_RANK_STRUCTURE = { ED: { share_target: "", gm_target: "" } };





// Options for the Type Selection Dropdown
const SETTING_TYPE_OPTIONS = [
    { value: 'simple_percentage', label: 'Simple Two-Rate (DP/Installment)' },
    { value: 'complex_percentage', label: 'Dynamic Designation Rates (%)' },
    { value: 'fixed_amount', label: 'Fixed Designation Amounts (BDT)' },
    { value: 'director_fund', label: 'Director Fund (Percentage & Frequency)' },
    { value: 'monthly_incentive_settings', label: 'Custom Monthly Incentive (Percentage & Levels)' }, 
    { value: 'director_rank_settings', label: 'Director Rank Targets' },
];


// Helper function to get the default structure based on key
const getInitialValue = (key) => {
    const keyLower = key.toLowerCase().replace(/\s/g, "_");
    if (COMPLEX_PERCENTAGE_KEYS.includes(keyLower)) {
        return {}; 
    }
    if (FIXED_AMOUNT_KEYS.includes(keyLower)) {
        return DEFAULT_INCENTIVE_STRUCTURE; 
    }
    if (DIRECTOR_FUND_KEYS.includes(keyLower) || keyLower.includes("_fund")) {
        return DEFAULT_DIRECTOR_FUND_STRUCTURE; 
    }
    if (MONTHLY_INCENTIVE_KEYS.includes(keyLower)) {
        return DEFAULT_MONTHLY_INCENTIVE_STRUCTURE;
    }
    if (DIRECTOR_RANK_KEYS.includes(keyLower)) {
        return DEFAULT_DIRECTOR_RANK_STRUCTURE;
    }
    // Fallback for other fund-like settings
    if (keyLower.includes("_fund_settings")) {
        return { percentage: "", frequency: "" };
    }
    return DEFAULT_SIMPLE_STRUCTURE;
};

// Helper to determine the type of setting for rendering
const getSettingType = (key) => {
    const keyLower = key.toLowerCase().replace(/\s/g, "_");
    if (COMPLEX_PERCENTAGE_KEYS.includes(keyLower)) return 'complex_percentage';
    if (FIXED_AMOUNT_KEYS.includes(keyLower)) return 'fixed_amount';
    if (DIRECTOR_FUND_KEYS.includes(keyLower) || keyLower.includes("_fund")) return 'director_fund'; 
    if (MONTHLY_INCENTIVE_KEYS.includes(keyLower)) return 'monthly_incentive_settings'; 
    if (DIRECTOR_RANK_KEYS.includes(keyLower)) return 'director_rank_settings';
    return 'simple_percentage';
};

// ----------------------------------------------------------------
// --- Dynamic Component for Fixed Incentives (AMOUNTS) ---
// ----------------------------------------------------------------
const FixedIncentiveForm = ({ value, onChange }) => {
    const handleNestedChange = (designation, val) => {
        onChange({
            ...value,
            [designation]: val,
        });
    };

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4 bg-white p-2 rounded-xl border border-blue-200">
                <span className="font-bold text-gray-700 text-sm">Designation</span>
                <span className="font-bold text-gray-700 text-sm">Fixed Amount (BDT)</span>
            </div>

            {INCENTIVE_DESIGNATIONS.map(designation => (
                <div key={designation} className="grid grid-cols-2 gap-4 items-center p-2 bg-blue-50 rounded-lg">
                    <strong className="text-md font-bold text-gray-800">{designation}</strong>
                    
                    <div className="relative">
                        <input
                            type="number"
                            step="1000"
                            min="0"
                            value={String(value[designation] || '')}
                            onChange={(e) => handleNestedChange(designation, e.target.value)}
                            className="w-full border border-gray-300 pr-3 py-1.5 rounded-lg text-sm"
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};

// ----------------------------------------------------------------
// --- Dynamic Component for Complex Percentage Bonus (DYNAMIC ROWS) ---
// ----------------------------------------------------------------
const DynamicDevelopmentBonusForm = ({ value, onChange }) => {
    
    const [designationRows, setDesignationRows] = useState(() => {
        const initialRows = Object.entries(value || {}).map(([key, rates]) => ({
            id: uuidv4(), 
            designation: key,
            down_payment: String(rates.down_payment || ""),
            installment: String(rates.installment || ""),
        }));

        return initialRows.length > 0 ? initialRows : [{ 
            id: uuidv4(), 
            designation: '', 
            down_payment: '', 
            installment: '' 
        }];
    });

    const handleRateChange = (id, field, val) => {
        const newRows = designationRows.map(row => {
            if (row.id === id) {
                return { ...row, [field]: val };
            }
            return row;
        });
        setDesignationRows(newRows);
    };

    const handleAddRow = () => {
        setDesignationRows(prev => [
            ...prev,
            { id: uuidv4(), designation: '', down_payment: '', installment: '' }
        ]);
    };

    const handleRemoveRow = (id) => {
        setDesignationRows(prev => prev.filter(row => row.id !== id));
    };

    useEffect(() => {
        const newBonusStructure = designationRows.reduce((acc, row) => {
            if (row.designation.trim()) {
                acc[row.designation.toUpperCase().trim()] = {
                    down_payment: row.down_payment, 
                    installment: row.installment,
                };
            }
            return acc;
        }, {});

        onChange(newBonusStructure);
        
    }, [designationRows, onChange]);


    return (
        <div className="space-y-4">
            <div className="grid grid-cols-[1fr_1fr_1fr_40px] gap-4 bg-white p-2 rounded-xl border border-green-200">
                <span className="font-bold text-gray-700 text-sm">Designation</span>
                <span className="font-bold text-gray-700 text-sm">Down Payment (%)</span>
                <span className="font-bold text-gray-700 text-sm">Installment (%)</span>
                <span></span> 
            </div>

            {designationRows.map((row) => (
                <div key={row.id} className="grid grid-cols-[1fr_1fr_1fr_40px] gap-4 items-center p-2 bg-green-50 rounded-lg">
                    {/* Designation Input */}
                    <input
                        type="text"
                        placeholder="e.g., VP, MO, New Level"
                        value={row.designation}
                        onChange={(e) => handleRateChange(row.id, 'designation', e.target.value)}
                        className="w-full border border-gray-300 px-3 py-1.5 rounded-lg text-sm font-semibold text-gray-800"
                        required
                    />
                    
                    {/* Down Payment Input */}
                    <div className="relative">
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={row.down_payment}
                            onChange={(e) => handleRateChange(row.id, 'down_payment', e.target.value)}
                            className="w-full border border-gray-300 pr-8 py-1.5 rounded-lg text-sm"
                            required
                        />
                        <span className="absolute inset-y-0 right-0 pr-2 flex items-center text-green-700 text-xs font-bold">%</span>
                    </div>

                    {/* Installment Input */}
                    <div className="relative">
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={row.installment}
                            onChange={(e) => handleRateChange(row.id, 'installment', e.target.value)}
                            className="w-full border border-gray-300 pr-8 py-1.5 rounded-lg text-sm"
                            required
                        />
                        <span className="absolute inset-y-0 right-0 pr-2 flex items-center text-green-700 text-xs font-bold">%</span>
                    </div>
                    
                    {/* Remove Button */}
                    <button 
                        type="button"
                        onClick={() => handleRemoveRow(row.id)}
                        className="text-red-500 hover:text-red-700 disabled:opacity-50"
                        disabled={designationRows.length === 1}
                        title="Remove designation"
                    >
                        <FaTimesCircle className="w-5 h-5" />
                    </button>
                </div>
            ))}
            
            <button
                type="button"
                onClick={handleAddRow}
                className="flex items-center text-sm font-semibold text-green-600 hover:text-green-800 mt-4"
            >
                <FaPlusCircle className="w-4 h-4 mr-2" /> Add Designation Row
            </button>
        </div>
    );
};

// ----------------------------------------------------------------
// --- Component for Director Fund Structure (CUSTOM FIELDS) ---
// ----------------------------------------------------------------
const GenericFundForm = ({ value, onChange }) => {
    // Check if the value is a simple structure {percentage, frequency} or a complex one with designations.
    const isSimpleStructure = typeof value?.percentage !== 'undefined' || typeof value?.frequency !== 'undefined';

    const handleSimpleChange = (e) => {
        const { name, value: val } = e.target;
        onChange({ ...value, [name]: val });
    };

    const handleComplexChange = (designation, field, val) => {
        onChange({
            ...value,
            [designation]: {
                ...(value[designation] || {}),
                [field]: val,
            },
        });
    };

    if (isSimpleStructure) {
        return (
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Percentage (%)</label>
                    <div className="relative">
                        <input
                            type="number" name="percentage" step="0.01" min="0"
                            value={String(value.percentage || '')}
                            onChange={handleSimpleChange}
                            className="w-full border border-gray-300 pr-8 py-1.5 rounded-lg text-sm"
                            required
                        />
                        <span className="absolute inset-y-0 right-0 pr-2 flex items-center text-orange-700 text-xs font-bold">%</span>
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Frequency</label>
                    <input
                        type="text" name="frequency" placeholder="e.g., quarterly, yearly"
                        value={String(value.frequency || '')}
                        onChange={handleSimpleChange}
                        className="w-full border border-gray-300 px-3 py-1.5 rounded-lg text-sm"
                        required
                    />
                </div>
            </div>
        );
    }

    // Fallback to the complex, designation-based form
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4 bg-white p-2 rounded-xl border border-orange-200">
                <span className="font-bold text-gray-700 text-sm">Designation</span>
                <span className="font-bold text-gray-700 text-sm">Percentage (%)</span>
                <span className="font-bold text-gray-700 text-sm">Frequency</span>
                <span className="font-bold text-gray-700 text-sm">Share Value/Units</span>
            </div>

            {DIRECTOR_FUND_DESIGNATIONS.map(designation => {
                const isDIR = designation === 'DIR';
                const currentRates = value[designation] || {};

                return (
                    <div key={designation} className="grid grid-cols-4 gap-4 items-center p-2 bg-orange-50 rounded-lg">
                        <strong className="text-md font-bold text-gray-800">{designation}</strong>
                        <div className="relative">
                            <input
                                type="number" step="0.01" min="0"
                                value={String(currentRates.percentage || '')}
                                onChange={(e) => handleComplexChange(designation, 'percentage', e.target.value)}
                                className="w-full border border-gray-300 pr-8 py-1.5 rounded-lg text-sm"
                                required
                            />
                            <span className="absolute inset-y-0 right-0 pr-2 flex items-center text-orange-700 text-xs font-bold">%</span>
                        </div>
                        <div className="relative">
                            {!isDIR ? (
                                <input
                                    type="text" placeholder="e.g., yearly, quarterly"
                                    value={String(currentRates.frequency || '')}
                                    onChange={(e) => handleComplexChange(designation, 'frequency', e.target.value)}
                                    className="w-full border border-gray-300 px-3 py-1.5 rounded-lg text-sm"
                                    required
                                />
                            ) : <span className="text-gray-500 italic text-sm">N/A</span>}
                        </div>
                        <div className="relative">
                            {isDIR ? (
                                <input
                                    type="number" step="1" min="0" placeholder="Per Person Share"
                                    value={String(currentRates.per_person_share || '')}
                                    onChange={(e) => handleComplexChange(designation, 'per_person_share', e.target.value)}
                                    className="w-full border border-gray-300 px-3 py-1.5 rounded-lg text-sm"
                                    required
                                />
                            ) : <span className="text-gray-500 italic text-sm">N/A</span>}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};


// ----------------------------------------------------------------
// --- NEW Component for Custom Monthly Incentive Structure ---
// ----------------------------------------------------------------
const MonthlyIncentiveSettingsForm = ({ value, onChange }) => {
    const handleChange = (e) => {
        const { name, value: val } = e.target;
        onChange({
            ...value,
            [name]: val,
        });
    };

    return (
        <div className="grid grid-cols-2 gap-4">
            <div className="relative">
                <label className="block text-xs font-bold text-gray-700 mb-1">Percentage (%)</label>
                <input
                    type="number"
                    name="percentage"
                    step="0.01"
                    min="0"
                    value={String(value.percentage || '')}
                    onChange={handleChange}
                    className="w-full border border-gray-300 pr-8 py-1.5 rounded-lg text-sm"
                    required
                />
                <span className="absolute inset-y-0 right-0 pr-2 flex items-center text-red-700 text-xs font-bold">%</span>
            </div>

            <div className="relative">
                <label className="block text-xs font-bold text-gray-700 mb-1">Maximum Levels</label>
                <input
                    type="number"
                    name="max_levels"
                    step="1"
                    min="1"
                    value={String(value.max_levels || '')}
                    onChange={handleChange}
                    className="w-full border border-gray-300 px-3 py-1.5 rounded-lg text-sm"
                    required
                />
            </div>
        </div>
    );
};

// ----------------------------------------------------------------
// --- NEW Component for Director Rank Settings ---
// ----------------------------------------------------------------
const DirectorRankSettingsForm = ({ value, onChange }) => {
    const [rows, setRows] = useState(() => {
        const initialRows = Object.entries(value || {}).map(([designation, targets]) => ({
            id: uuidv4(),
            designation,
            share_target: String(targets.share_target || ""),
            gm_target: String(targets.gm_target || ""),
        }));
        return initialRows.length > 0 ? initialRows : [{ id: uuidv4(), designation: '', share_target: '', gm_target: '' }];
    });

    const handleRowChange = (id, field, val) => {
        const newRows = rows.map(row => (row.id === id ? { ...row, [field]: val } : row));
        setRows(newRows);
    };

    const handleAddRow = () => {
        setRows(prev => [...prev, { id: uuidv4(), designation: '', share_target: '', gm_target: '' }]);
    };

    const handleRemoveRow = (id) => {
        setRows(prev => prev.filter(row => row.id !== id));
    };

    useEffect(() => {
        const newStructure = rows.reduce((acc, row) => {
            if (row.designation.trim()) {
                acc[row.designation.toUpperCase().trim()] = {
                    share_target: row.share_target,
                    gm_target: row.gm_target,
                };
            }
            return acc;
        }, {});
        onChange(newStructure);
    }, [rows, onChange]);

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-[1fr_1fr_1fr_40px] gap-4 bg-white p-2 rounded-xl border border-indigo-200">
                <span className="font-bold text-gray-700 text-sm">Designation</span>
                <span className="font-bold text-gray-700 text-sm">Share Target</span>
                <span className="font-bold text-gray-700 text-sm">GM Target</span>
                <span></span>
            </div>

            {rows.map(row => (
                <div key={row.id} className="grid grid-cols-[1fr_1fr_1fr_40px] gap-4 items-center p-2 bg-indigo-50 rounded-lg">
                    <input type="text" placeholder="e.g., ED" value={row.designation} onChange={(e) => handleRowChange(row.id, 'designation', e.target.value)} className="w-full border border-gray-300 px-3 py-1.5 rounded-lg text-sm" required />
                    <input type="number" placeholder="e.g., 10" value={row.share_target} onChange={(e) => handleRowChange(row.id, 'share_target', e.target.value)} className="w-full border border-gray-300 px-3 py-1.5 rounded-lg text-sm" required />
                    <input type="number" placeholder="e.g., 10" value={row.gm_target} onChange={(e) => handleRowChange(row.id, 'gm_target', e.target.value)} className="w-full border border-gray-300 px-3 py-1.5 rounded-lg text-sm" required />
                    <button type="button" onClick={() => handleRemoveRow(row.id)} className="text-red-500 hover:text-red-700 disabled:opacity-50" disabled={rows.length === 1} title="Remove row">
                        <FaTimesCircle className="w-5 h-5" />
                    </button>
                </div>
            ))}
            <button type="button" onClick={handleAddRow} className="flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-800 mt-4">
                <FaPlusCircle className="w-4 h-4 mr-2" /> Add Rank Target
            </button>
        </div>
    );
};

// ----------------------------------------------------------------
// --- Reusable Component for a Single New/Edited Setting Entry ---
// ----------------------------------------------------------------
const NewSettingForm = ({ setting, index, onChange, onRemove, isEditMode }) => {
    
    const currentKeyLower = setting.key.toLowerCase().replace(/\s/g, "_");
    // Determine type based on the key name *if* editing, otherwise use the key name from the current form data
    const settingType = isEditMode ? getSettingType(currentKeyLower) : getSettingType(setting.key) || 'simple_percentage'; 
    

    const handleKeyChange = (e) => {
        const { value } = e.target;
        onChange(index, { 
            ...setting, 
            key: value,
        });
    };

    // Handler to select the initial structure type (Only for Creation)
    const handleTypeChange = (e) => {
        const newType = e.target.value;
        let newDefaultValue = getInitialValue(newType);

        onChange(index, {
            ...setting,
            key: "", // Reset key when changing type (optional but safer)
            value: newDefaultValue,
        });
    };


    const handleSimpleValueChange = (e) => {
        const { name, value } = e.target;
        onChange(index, {
            ...setting,
            value: {
                ...setting.value,
                [name]: value,
            }
        });
    };
    
    const handleComplexValueChange = (newValue) => {
        onChange(index, { ...setting, value: newValue });
    };

    const currentSelectedType = settingType;


    return (
        <div className={`p-6 rounded-xl shadow-md border-2 ${isEditMode ? 'border-yellow-400' : 'border-blue-300 bg-white'}`}>
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200">
                <h4 className="text-lg font-bold text-gray-800">Setting #{index + 1}</h4>
                {!isEditMode && onRemove && (
                    <button 
                        type="button" 
                        onClick={() => onRemove(index)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Remove this setting"
                    >
                        <FaMinusCircle className="w-5 h-5" />
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                
                {/* Setting Type Dropdown (Only for Creation Mode) */}
                {!isEditMode && (
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Select Setting Type</label>
                        <select
                            // Use the type determined by the current structure in the form data
                            value={getSettingType(setting.key)} 
                            onChange={handleTypeChange}
                            className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm bg-white"
                        >
                            {SETTING_TYPE_OPTIONS.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
                
                {/* Setting Key Name Input */}
                <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Setting Key Name</label>
                    <input
                        type="text"
                        name="key"
                        value={setting.key}
                        onChange={handleKeyChange}
                        required
                        placeholder="e.g., Year End Bonus or Monthly Incentives"
                        className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm"
                        disabled={isEditMode} // Cannot change key name when editing
                    />
                </div>
            </div>
            
            {/* Conditional Rendering based on settingType */}

            {settingType === 'complex_percentage' && (
                <div className="mt-4 p-3 border border-green-200 rounded-lg">
                    <p className="text-xs font-semibold text-green-700 mb-2 flex items-center">
                       <FaUserTie className="mr-2" /> Dynamic Percentage Structure (Designation Rates)
                    </p>
                    <DynamicDevelopmentBonusForm 
                        value={setting.value || {}} 
                        onChange={handleComplexValueChange} 
                    />
                </div>
            )}
            
            {settingType === 'fixed_amount' && (
                <div className="mt-4 p-3 border border-purple-200 rounded-lg">
                    <p className="text-xs font-semibold text-purple-700 mb-2 flex items-center">
                       <FaMoneyBillWave className="mr-2" /> Fixed Amount Structure (Designation Incentives)
                    </p>
                    <FixedIncentiveForm 
                        value={setting.value || DEFAULT_INCENTIVE_STRUCTURE} 
                        onChange={handleComplexValueChange} 
                    />
                </div>
            )}

            {settingType === 'director_fund' && ( 
                <div className="mt-4 p-3 border border-orange-200 rounded-lg">
                    <p className="text-xs font-semibold text-orange-700 mb-2 flex items-center">
                       <FaDollarSign className="mr-2" /> Director Fund Structure (Percentage & Frequency/Share)
                    </p>
                    <GenericFundForm 
                        value={setting.value || DEFAULT_DIRECTOR_FUND_STRUCTURE} 
                        onChange={handleComplexValueChange} 
                    />
                </div>
            )}

            {settingType === 'monthly_incentive_settings' && ( 
                <div className="mt-4 p-3 border border-red-200 rounded-lg">
                    <p className="text-xs font-semibold text-red-700 mb-2 flex items-center">
                       <FaChartLine className="mr-2" /> Custom Monthly Incentive Structure
                    </p>
                    <MonthlyIncentiveSettingsForm 
                        value={setting.value || DEFAULT_MONTHLY_INCENTIVE_STRUCTURE} 
                        onChange={handleComplexValueChange} 
                    />
                </div>
            )}

            {settingType === 'director_rank_settings' && (
                <div className="mt-4 p-3 border border-indigo-200 rounded-lg">
                    <p className="text-xs font-semibold text-indigo-700 mb-2 flex items-center">
                       <FaUserTie className="mr-2" /> Director Rank Target Structure
                    </p>
                    <DirectorRankSettingsForm
                        value={setting.value || DEFAULT_DIRECTOR_RANK_STRUCTURE}
                        onChange={handleComplexValueChange}
                    />
                </div>
            )}

            {settingType === 'simple_percentage' && (
                <div className="grid grid-cols-2 gap-4 mt-4">
                    {/* Simple Down Payment Field */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Down Payment Rate (%)</label>
                        <div className="relative">
                            <input
                                type="number"
                                name="down_payment"
                                value={setting.value?.down_payment || ''}
                                onChange={handleSimpleValueChange}
                                required
                                step="0.01"
                                min="0"
                                className="w-full border border-gray-300 pr-8 pl-3 py-2 rounded-lg text-sm"
                            />
                            <span className="absolute inset-y-0 right-0 pr-2 flex items-center text-green-700 text-xs font-bold">%</span>
                        </div>
                    </div>

                    {/* Simple Installment Field */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Installment Rate (%)</label>
                        <div className="relative">
                            <input
                                type="number"
                                name="installment"
                                value={setting.value?.installment || ''}
                                onChange={handleSimpleValueChange}
                                required
                                step="0.01"
                                min="0"
                                className="w-full border border-gray-300 pr-8 pl-3 py-2 rounded-lg text-sm"
                            />
                            <span className="absolute inset-y-0 right-0 pr-2 flex items-center text-green-700 text-xs font-bold">%</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


// ----------------------------------------------------------------
// --- Main Component ---
// ----------------------------------------------------------------
const CommissionSettings = () => {
    // --- State Initialization ---
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [settings, setSettings] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const [editingSetting, setEditingSetting] = useState(null); 
    const [formData, setFormData] = useState([]); 

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState(null); 

    // --- Constants and Utility Functions ---
    const BASE_URL = "https://alhamarahomesbd.com/alhamra-backend/public/api/v1"; 
    const token = localStorage.getItem("authToken");
    const isEditMode = !!editingSetting;

    const filteredSettings = useMemo(() => {
        if (!searchTerm) return settings;
        const searchLower = searchTerm.toLowerCase();
        return settings.filter(setting => 
            setting.key.toLowerCase().includes(searchLower) ||
            formatKey(setting.key).toLowerCase().includes(searchLower)
        );
    }, [settings, searchTerm]);


    const formatKey = (key) =>
        key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()).trim();

    const resetForm = () => {
        setFormData([]);
        setEditingSetting(null);
        setIsModalOpen(false);
    };

    /**
     * Helper to render the value structure for the list view.
     */
    const renderValue = (setting) => {
        const settingType = getSettingType(setting.key);

        if (settingType === 'complex_percentage') {
            return (
                <div className="space-y-2 pt-2 border-t border-gray-100">
                    <p className="text-xs font-semibold text-gray-500">Designation Rates (DP/Inst):</p>
                    {Object.entries(setting.value).map(([designation, rates]) => (
                        <div key={designation} className="flex justify-between text-sm p-1 bg-gray-50 rounded-md">
                            <span className="font-bold text-gray-800">{designation}:</span>
                            <div className="text-right">
                                <span className="text-blue-600 font-medium">{rates.down_payment || 0}%</span> / 
                                <span className="text-green-600 font-medium"> {rates.installment || 0}%</span>
                            </div>
                        </div>
                    ))}
                </div>
            );
        }
        
        if (settingType === 'fixed_amount') {
            return (
                <div className="space-y-2 pt-2 border-t border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 flex items-center">
                        <FaMoneyBillWave className="mr-1 text-purple-600" /> Fixed Monthly Incentives:
                    </p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                        {Object.entries(setting.value).map(([designation, amount]) => (
                            <div key={designation} className="flex justify-between p-1 bg-purple-50 rounded-md">
                                <span className="font-bold text-gray-800">{designation}:</span>
                                <span className="text-purple-600 font-bold">
                                    {Number(amount).toLocaleString()} BDT
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        if (settingType === 'director_fund') {
            return (
                <div className="space-y-2 pt-2 border-t border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 flex items-center">
                        <FaDollarSign className="mr-1 text-orange-600" /> Fund Distribution:
                    </p>
                    {/* Check if value contains percentage/frequency directly, or nested objects */}
                    {typeof setting.value.percentage !== 'undefined' ? (
                        <div className="space-y-1 text-sm">
                            <div className="flex justify-between p-1 bg-orange-50 rounded-md">
                                <span className="font-semibold text-gray-700">Percentage:</span>
                                <span className="text-orange-600 font-bold">{setting.value.percentage}%</span>
                            </div>
                            <div className="flex justify-between p-1 bg-orange-50 rounded-md">
                                <span className="font-semibold text-gray-700">Frequency:</span>
                                <span className="text-orange-600 font-bold">{setting.value.frequency}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                            {Object.entries(setting.value).map(([designation, details]) => (
                                <div key={designation} className="flex justify-between p-1 bg-orange-50 rounded-md">
                                    <span className="font-bold text-gray-800">{designation}:</span>
                                    <span className="text-orange-600 font-bold">
                                        {details.percentage}% {details.frequency ? ` (${details.frequency})` : ''}
                                        {details.per_person_share ? ` (Share: ${details.per_person_share})` : ''}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            );
        }

        if (settingType === 'director_rank_settings') {
            return (
                <div className="space-y-2 pt-2 border-t border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 flex items-center">
                        <FaUserTie className="mr-1 text-indigo-600" /> Director Rank Targets:
                    </p>
                    <div className="space-y-1 text-sm">
                        {Object.entries(setting.value).map(([designation, targets]) => (
                            <div key={designation} className="p-1 bg-indigo-50 rounded-md">
                                <div className="flex justify-between">
                                    <span className="font-bold text-gray-800">{designation}:</span>
                                    <span className="text-indigo-600 font-bold">Share: {targets.share_target} / GM: {targets.gm_target}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        if (settingType === 'monthly_incentive_settings') {
            return (
                <div className="space-y-2 pt-2 border-t border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 flex items-center">
                        <FaChartLine className="mr-1 text-red-600" /> Incentive Structure:
                    </p>
                    <div className="flex justify-between p-1 bg-red-50 rounded-md text-sm">
                        <span className="font-bold text-gray-800">Percentage:</span>
                        <span className="text-red-600 font-bold">{setting.value?.percentage || 0}%</span>
                    </div>
                    <div className="flex justify-between p-1 bg-red-50 rounded-md text-sm">
                        <span className="font-bold text-gray-800">Max Levels:</span>
                        <span className="text-red-600 font-bold">{setting.value?.max_levels || 0}</span>
                    </div>
                </div>
            );
        }

        // --- Handle Simple/Other/Unknown Structures (Fallback) ---
        return (
            <div className="space-y-2 pt-2 border-t border-gray-100">
                
                {/* Specific check for single-value objects like `service_sales` or fund settings */}
                {typeof setting.value === 'object' && setting.value !== null && Object.keys(setting.value).length > 0 && !('down_payment' in setting.value) && (
                    <div className="space-y-1 text-sm">
                        {Object.entries(setting.value).map(([key, val]) => (
                             <div key={key} className="flex justify-between">
                                 <span className="font-semibold text-gray-700">{formatKey(key)}:</span>
                                 <span className="text-gray-800 font-bold">{val}{key.includes('percentage') ? '%' : ''}</span>
                             </div>
                        ))}
                    </div>
                )}

                {(typeof setting.value === 'number' || typeof setting.value === 'string') && (
                    <p className="font-medium text-gray-800 flex items-center">
                        <FaAsterisk className="w-3 h-3 mr-2 text-gray-400"/> Value: 
                        <span className="text-blue-600 font-bold ml-2">
                            {Number(setting.value).toLocaleString() || setting.value}
                        </span>
                    </p>
                )}

                {typeof setting.value === 'object' && setting.value !== null && 'down_payment' in setting.value && 'installment' in setting.value && (
                    <div className="flex space-x-4 text-sm">
                        <p className="font-medium text-gray-800">
                            DP: <span className="text-blue-600 font-bold">{setting.value?.down_payment || 0}%</span>
                        </p>
                        <p className="font-medium text-gray-800">
                            Installment: <span className="text-green-600 font-bold">{setting.value?.installment || 0}%</span>
                        </p>
                    </div>
                )}

                {typeof setting.value === 'object' && setting.value !== null && !('down_payment' in setting.value) && Object.keys(setting.value).length === 0 && (
                    <div className="space-y-1 text-sm bg-gray-50 p-2 rounded-md">
                        <p className="text-xs font-semibold text-gray-500 flex items-center">
                             <FaCubes className="w-3 h-3 mr-2 text-gray-400"/> Other Structure:
                        </p>
                        {Object.entries(setting.value).map(([key, val]) => (
                             <div key={key} className="flex justify-between border-b border-gray-100 last:border-b-0 py-0.5">
                                 <span className="font-semibold text-gray-700">{formatKey(key)}:</span>
                                 <span className="text-gray-600">{
                                     typeof val === 'object' && val !== null ? JSON.stringify(val) : val
                                 }</span>
                             </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };


    // --- API Handlers ---
    const fetchSettings = useCallback(async () => { 
        if (!token) { toast.error("Authentication token missing. Please log in."); setLoading(false); return; }
        setLoading(true);
        try {
            const res = await fetch(`${BASE_URL}/commission-settings`, { headers: { Authorization: `Bearer ${token}` }, });
            if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
            const data = await res.json();
            
            const formattedSettings = (data.data || []).map(item => ({
                ...item,
                value: typeof item.value === 'string' ? JSON.parse(item.value) : item.value
            }));
            setSettings(formattedSettings);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load commission settings.");
        } finally {
            setLoading(false);
        }
    }, [token]);
    
    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);


    const handleDelete = async (id) => { 
        if (window.confirm("Are you sure you want to delete this setting?")) {
            setDeletingId(id);
            try {
                const res = await fetch(`${BASE_URL}/commission-settings/${id}`, { 
                    method: 'DELETE', 
                    headers: { Authorization: `Bearer ${token}` } 
                });
                if (!res.ok) throw new Error('Failed to delete setting.');

                setSettings(prev => prev.filter(s => s.id !== id));
                toast.success("Setting deleted successfully!");

            } catch (error) {
                console.error("Deletion error:", error);
                toast.error("Error deleting setting.");
            } finally {
                setDeletingId(null);
            }
        }
    };
    
    /**
     * ✅ Corrected function: Handles both creation (POST) and updating (PUT).
     */
    const handleSave = async () => {
        if (!token) {
            toast.error("Authentication token missing.");
            return;
        }

        if (formData.some(s => !s.key.trim() || !s.value)) {
             toast.error("Setting key and value must not be empty.");
             return;
        }

        const endpoint = isEditMode
            ? `${BASE_URL}/commission-settings/${editingSetting.id}`
            : `${BASE_URL}/commission-settings`;
        
        const method = isEditMode ? 'PUT' : 'POST';
        
        // Prepare data:
        const preparedData = formData.map(setting => ({
            ...setting,
            key: setting.key.trim().toLowerCase().replace(/\s/g, "_"), // Enforce snake_case
            value: JSON.stringify(setting.value), 
            // Important for Laravel PUT/PATCH handling:
            _method: isEditMode ? 'PUT' : undefined, 
        }));
        
        const body = isEditMode ? preparedData[0] : { settings: preparedData };

        setIsSubmitting(true);
        try {
            const res = await fetch(endpoint, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            });
            
            if (!res.ok) {
                const errorData = await res.json();
                console.error('API Error:', errorData);
                throw new Error(`Failed to ${isEditMode ? 'update' : 'create'} settings. ${errorData.message || 'Check network and server logs.'}`);
            }

            toast.success(`Setting(s) ${isEditMode ? 'updated' : 'created'} successfully!`);
            await fetchSettings(); // Refresh the list
            resetForm(); // Close modal and reset state

        } catch (error) {
            console.error("Save error:", error);
            toast.error(`Error ${isEditMode ? 'updating' : 'creating'} setting: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };


    // --- JSX Return ---
    return (
        <div className="flex h-screen overflow-hidden">
            {/* Sidebar */}
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            {/* Content area */}
            <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                {/* Header */}
                <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

                <main>
                    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
                        {/* Page header */}
                        <div className="mb-8">
                            <h1 className="text-2xl md:text-3xl text-gray-800 font-bold flex items-center">
                                <FaCog className="mr-3 dark:text-white text-dark" /> Commission Settings
                            </h1>
                        </div>

                        {/* Search and Add Setting Button */}
                        <div className="mb-4 flex justify-between items-center">
                            <input
                                type="text"
                                placeholder="Search settings by key..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="border border-gray-300 px-4 py-2 rounded-lg w-1/3 text-sm"
                            />
                            {/* <button
                                onClick={() => { 
                                    resetForm(); 
                                    setFormData([{ id: uuidv4(), key: 'new_setting', value: DEFAULT_SIMPLE_STRUCTURE }]); 
                                    setIsModalOpen(true); 
                                }}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center transition duration-150"
                            >
                                <FaPlusCircle className="w-4 h-4 mr-2" /> Add New Setting
                            </button> */}
                        </div>

                        {/* Settings List */}
                        <div className="bg-white shadow-lg rounded-xl border border-gray-200">
                            <header className="px-5 py-4 border-b border-gray-100">
                                <h2 className="font-semibold text-gray-800">{loading ? 'Loading...' : `Total Settings: ${filteredSettings.length}`}</h2>
                            </header>
                            <div className="p-3">
                                {loading ? (
                                    <div className="flex justify-center items-center p-10 text-blue-500">
                                        <FaSpinner className="animate-spin w-8 h-8 mr-3" /> Loading Settings...
                                    </div>
                                ) : filteredSettings?.length === 0 ? (
                                    <div className="p-10 text-center text-gray-500">No settings found.</div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {filteredSettings?.map((setting) => (
                                            <div key={setting.id} className="p-4 border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition duration-150">
                                                <div className="flex justify-between items-start mb-3 border-b pb-2">
                                                    <h3 className="font-extrabold text-md text-gray-900 break-words pr-2">
                                                        {formatKey(setting.key)}
                                                    </h3>
                                                    <div className="flex space-x-2">
                                                        <button 
                                                            onClick={() => { setEditingSetting(setting); setFormData([{...setting, value: setting.value}]); setIsModalOpen(true); }}
                                                            className="text-yellow-500 hover:text-yellow-700"
                                                            title="Edit setting"
                                                        >
                                                            <FaEdit className="w-4 h-4" />
                                                        </button>
                                                        {/* <button 
                                                            onClick={() => handleDelete(setting.id)}
                                                            className="text-red-500 hover:text-red-700 disabled:opacity-50"
                                                            disabled={deletingId === setting.id}
                                                            title="Delete setting"
                                                        >
                                                            {deletingId === setting.id ? <FaSpinner className="animate-spin w-4 h-4" /> : <FaTrashAlt className="w-4 h-4" />}
                                                        </button> */}
                                                    </div>
                                                </div>
                                                {renderValue(setting)}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
            <ToastContainer position="bottom-right" autoClose={3000} />

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={() => setIsModalOpen(false)}>
                    <div 
                        className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" 
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="p-6">
                            <h3 className="text-xl font-bold mb-4 border-b pb-2">
                                {isEditMode ? `Editing: ${formatKey(editingSetting.key)}` : 'Add New Commission Setting'}
                            </h3>
                            
                            <form 
                                onSubmit={(e) => { e.preventDefault(); handleSave(); }}
                                className="space-y-6"
                            >
                                {formData.map((setting, index) => (
                                    <NewSettingForm
                                        key={setting.id || index} 
                                        setting={setting}
                                        index={index}
                                        isEditMode={isEditMode}
                                        onChange={(idx, newSetting) => {
                                            setFormData(prev => prev.map((s, i) => i === idx ? newSetting : s));
                                        }}
                                        onRemove={!isEditMode && formData.length > 1 ? (idx) => setFormData(prev => prev.filter((_, i) => i !== idx)) : null}
                                    />
                                ))}

                                {/* Add New Setting Row Button (Only in Create Mode) */}
                                {!isEditMode && (
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => [...prev, { id: uuidv4(), key: `new_setting_${prev.length + 1}`, value: DEFAULT_SIMPLE_STRUCTURE }])}
                                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center mt-4"
                                    >
                                        <FaPlusCircle className="w-4 h-4 mr-2" /> Add Another Setting
                                    </button>
                                )}

                                <div className="flex justify-end space-x-3 pt-4 border-t mt-4">
                                    <button 
                                        type="button" 
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-100"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center"
                                    >
                                        {isSubmitting ? <FaSpinner className="animate-spin mr-2" /> : (isEditMode ? 'Update Setting' : 'Save Settings')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CommissionSettings;