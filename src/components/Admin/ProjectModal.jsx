'use client';

import { useState, useEffect } from 'react';
import { IoClose, IoAddCircleOutline, IoRemoveCircle } from 'react-icons/io5';
import projectService from '@/services/projectService';
import { getAllUsers } from '@/services/userService'; // Import the named export

export default function ProjectModal({ project, onClose, onSuccess }) {
    const [loading, setLoading] = useState(false);
    const [employees, setEmployees] = useState([]);
    const [managers, setManagers] = useState([]);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        client: '',
        projectManager: '',
        startDate: '',
        endDate: '',
        estimatedHours: '',
        status: 'Planning',
        priority: 'Medium',
        budget: '',
        technologies: [],
        notes: '',
        assignedEmployees: [],
    });

    const [newTechnology, setNewTechnology] = useState('');
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchEmployees();
        if (project) {
            setFormData({
                name: project.name || '',
                description: project.description || '',
                client: project.client || '',
                projectManager: project.projectManager?._id || '',
                startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
                endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
                estimatedHours: project.estimatedHours || '',
                status: project.status || 'Planning',
                priority: project.priority || 'Medium',
                budget: project.budget || '',
                technologies: project.technologies || [],
                notes: project.notes || '',
                assignedEmployees:
                    project.assignedEmployees
                        ?.filter(emp => emp?.employee?._id)
                        .map(emp => ({
                            employee: emp.employee._id,
                            role: emp.role || 'Developer',
                            allocatedHours: emp.allocatedHours || 0,
                        })) || [],
            });
        }
    }, [project]);

    const fetchEmployees = async () => {
        try {
            // Use getAllUsers with filters
            const response = await getAllUsers({ status: 'Active' });
            const allUsers = response.data || [];

            setEmployees(allUsers);

            // Filter managers (users with admin role or specific department)
            const managersList = allUsers.filter(
                user => user.role === 'admin' || user.department === 'Management'
            );
            setManagers(managersList.length > 0 ? managersList : allUsers);
        } catch (error) {
            console.error('Error fetching employees:', error);
            setEmployees([]);
            setManagers([]);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleAddTechnology = () => {
        if (newTechnology.trim()) {
            setFormData(prev => ({
                ...prev,
                technologies: [...prev.technologies, newTechnology.trim()]
            }));
            setNewTechnology('');
        }
    };

    const handleRemoveTechnology = (index) => {
        setFormData(prev => ({
            ...prev,
            technologies: prev.technologies.filter((_, i) => i !== index)
        }));
    };

    const handleAddEmployee = () => {
        setFormData(prev => ({
            ...prev,
            assignedEmployees: [
                ...prev.assignedEmployees,
                { employee: '', role: 'Developer', allocatedHours: 0 }
            ]
        }));
    };

    const handleRemoveEmployee = (index) => {
        setFormData(prev => ({
            ...prev,
            assignedEmployees: prev.assignedEmployees.filter((_, i) => i !== index)
        }));
    };

    const handleEmployeeChange = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            assignedEmployees: prev.assignedEmployees.map((emp, i) =>
                i === index ? { ...emp, [field]: value } : emp
            )
        }));
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.name.trim()) newErrors.name = 'Project name is required';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        if (!formData.projectManager) newErrors.projectManager = 'Project manager is required';
        if (!formData.startDate) newErrors.startDate = 'Start date is required';
        if (!formData.endDate) newErrors.endDate = 'End date is required';

        if (formData.startDate && formData.endDate) {
            if (new Date(formData.endDate) < new Date(formData.startDate)) {
                newErrors.endDate = 'End date must be after start date';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        try {
            setLoading(true);

            const submitData = {
                ...formData,
                estimatedHours: formData.estimatedHours ? Number(formData.estimatedHours) : 0,
                budget: formData.budget ? Number(formData.budget) : 0,
                assignedEmployees: formData.assignedEmployees
                    .filter(emp => emp.employee)
                    .map(emp => ({
                        ...emp,
                        allocatedHours: Number(emp.allocatedHours) || 0
                    }))
            };

            if (project) {
                await projectService.updateProject(project._id, submitData);
            } else {
                await projectService.createProject(submitData);
            }

            onSuccess();
        } catch (error) {
            console.error('Error saving project:', error);
            alert(error.response?.data?.message || 'Error saving project');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto text-black">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
                    <h2 className="text-xl font-bold text-slate-900">
                        {project ? 'Edit Project' : 'Create New Project'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <IoClose className="w-6 h-6 text-slate-600" />
                    </button>
                </div>

                {/* Form */}
                <div className="max-h-[70vh] overflow-y-auto">
                    <form onSubmit={handleSubmit} className="p-6">
                        <div className="space-y-6">
                            {/* Basic Information */}
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900 mb-4">Basic Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Project Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-2.5 border ${errors.name ? 'border-red-500' : 'border-slate-200'
                                                } rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500`}
                                            placeholder="Enter project name"
                                        />
                                        {errors.name && (
                                            <p className="text-sm text-red-600 mt-1">{errors.name}</p>
                                        )}
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Description *
                                        </label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            rows="3"
                                            className={`w-full px-4 py-2.5 border ${errors.description ? 'border-red-500' : 'border-slate-200'
                                                } rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none`}
                                            placeholder="Enter project description"
                                        />
                                        {errors.description && (
                                            <p className="text-sm text-red-600 mt-1">{errors.description}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Client Name
                                        </label>
                                        <input
                                            type="text"
                                            name="client"
                                            value={formData.client}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                            placeholder="Enter client name"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Project Manager *
                                        </label>
                                        <select
                                            name="projectManager"
                                            value={formData.projectManager}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-2.5 border ${errors.projectManager ? 'border-red-500' : 'border-slate-200'
                                                } rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500`}
                                        >
                                            <option value="">Select Manager</option>
                                            {managers.map(manager => (
                                                <option key={manager._id} value={manager._id}>
                                                    {manager.name} - {manager.email}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.projectManager && (
                                            <p className="text-sm text-red-600 mt-1">{errors.projectManager}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Timeline & Budget */}
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900 mb-4">Timeline & Budget</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Start Date *
                                        </label>
                                        <input
                                            type="date"
                                            name="startDate"
                                            value={formData.startDate}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-2.5 border ${errors.startDate ? 'border-red-500' : 'border-slate-200'
                                                } rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500`}
                                        />
                                        {errors.startDate && (
                                            <p className="text-sm text-red-600 mt-1">{errors.startDate}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            End Date *
                                        </label>
                                        <input
                                            type="date"
                                            name="endDate"
                                            value={formData.endDate}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-2.5 border ${errors.endDate ? 'border-red-500' : 'border-slate-200'
                                                } rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500`}
                                        />
                                        {errors.endDate && (
                                            <p className="text-sm text-red-600 mt-1">{errors.endDate}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Estimated Hours
                                        </label>
                                        <input
                                            type="number"
                                            name="estimatedHours"
                                            value={formData.estimatedHours}
                                            onChange={handleChange}
                                            min="0"
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                            placeholder="0"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Budget ($)
                                        </label>
                                        <input
                                            type="number"
                                            name="budget"
                                            value={formData.budget}
                                            onChange={handleChange}
                                            min="0"
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                            placeholder="0"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Status
                                        </label>
                                        <select
                                            name="status"
                                            value={formData.status}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                        >
                                            <option value="Planning">Planning</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="On Hold">On Hold</option>
                                            <option value="Completed">Completed</option>
                                            <option value="Cancelled">Cancelled</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Priority
                                        </label>
                                        <select
                                            name="priority"
                                            value={formData.priority}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                        >
                                            <option value="Low">Low</option>
                                            <option value="Medium">Medium</option>
                                            <option value="High">High</option>
                                            <option value="Critical">Critical</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Technologies */}
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900 mb-4">Technologies</h3>
                                <div className="flex gap-2 mb-3">
                                    <input
                                        type="text"
                                        value={newTechnology}
                                        onChange={(e) => setNewTechnology(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTechnology())}
                                        className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                        placeholder="Add technology (e.g., React, Node.js)"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddTechnology}
                                        className="px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                                    >
                                        Add
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {formData.technologies.map((tech, index) => (
                                        <div
                                            key={index}
                                            className="px-3 py-1.5 bg-slate-100 rounded-full flex items-center gap-2"
                                        >
                                            <span className="text-sm text-slate-700">{tech}</span>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveTechnology(index)}
                                                className="text-slate-500 hover:text-red-600 transition-colors"
                                            >
                                                <IoClose className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Assigned Employees */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-slate-900">Team Members</h3>
                                    <button
                                        type="button"
                                        onClick={handleAddEmployee}
                                        className="px-3 py-1.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm flex items-center gap-1"
                                    >
                                        <IoAddCircleOutline className="w-4 h-4" />
                                        Add Member
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {formData.assignedEmployees.map((emp, index) => (
                                        <div key={index} className="grid grid-cols-12 gap-3 items-start p-3 bg-slate-50 rounded-lg">
                                            <div className="col-span-5">
                                                <select
                                                    value={emp.employee}
                                                    onChange={(e) => handleEmployeeChange(index, 'employee', e.target.value)}
                                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                                                >
                                                    <option value="">Select Employee</option>
                                                    {employees.map(employee => (
                                                        <option key={employee._id} value={employee._id}>
                                                            {employee.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="col-span-3">
                                                <select
                                                    value={emp.role}
                                                    onChange={(e) => handleEmployeeChange(index, 'role', e.target.value)}
                                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                                                >
                                                    <option value="Developer">Developer</option>
                                                    <option value="Senior Developer">Senior Developer</option>
                                                    <option value="Designer">Designer</option>
                                                    <option value="Tester">Tester</option>
                                                    <option value="DevOps">DevOps</option>
                                                    <option value="Business Analyst">Business Analyst</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>

                                            <div className="col-span-3">
                                                <input
                                                    type="number"
                                                    value={emp.allocatedHours}
                                                    onChange={(e) => handleEmployeeChange(index, 'allocatedHours', e.target.value)}
                                                    min="0"
                                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                                                    placeholder="Hours"
                                                />
                                            </div>

                                            <div className="col-span-1 flex justify-end">
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveEmployee(index)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <IoRemoveCircle className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Additional Notes
                                </label>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    rows="3"
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                                    placeholder="Any additional information..."
                                />
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3 flex-shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-6 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Saving...
                            </>
                        ) : (
                            project ? 'Update Project' : 'Create Project'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}