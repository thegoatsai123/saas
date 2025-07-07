import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import {
  ArrowLeft,
  Edit,
  Settings,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  Target,
  Zap,
  Users,
  TrendingUp,
  BarChart3,
  Lightbulb,
  Eye,
  Calendar,
  Flag,
  ArrowRight,
  MoreHorizontal,
  Sparkles,
  Activity,
  Star,
  Filter,
  Search,
  RefreshCw,
  Download,
  Share2,
  Copy,
  Check,
  X,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Info,
  HelpCircle,
  MessageCircle,
  Link,
  ExternalLink,
  Play,
  Pause,
  Square,
  Circle,
  Triangle,
  Hexagon
} from 'lucide-react';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [flow, setFlow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [taskFilter, setTaskFilter] = useState('all');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('Medium');
  const [showAddTask, setShowAddTask] = useState(false);
  const [updatingTask, setUpdatingTask] = useState(null);

  useEffect(() => {
    fetchProject();
    fetchTasks();
    fetchFlow();
  }, [id]);

  const fetchProject = async () => {
    try {
      const response = await axios.get(`/api/projects/${id}`);
      setProject(response.data.project);
    } catch (error) {
      console.error('Error fetching project:', error);
      toast.error('Failed to load project');
      navigate('/projects');
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`/api/projects/${id}/tasks`);
      setTasks(response.data.tasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks');
    }
  };

  const fetchFlow = async () => {
    try {
      const response = await axios.get(`/api/projects/${id}/flow`);
      setFlow(response.data);
    } catch (error) {
      console.error('Error fetching flow:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskStatusUpdate = async (taskId, newStatus) => {
    setUpdatingTask(taskId);
    try {
      await axios.put(`/api/tasks/${taskId}`, { status: newStatus });
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      ));
      toast.success('Task updated successfully');
      
      // Refresh project data to update progress
      fetchProject();
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    } finally {
      setUpdatingTask(null);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      const response = await axios.post(`/api/projects/${id}/tasks`, {
        title: newTaskTitle,
        description: newTaskDescription,
        priority: newTaskPriority
      });
      
      setTasks([...tasks, response.data.task]);
      setNewTaskTitle('');
      setNewTaskDescription('');
      setNewTaskPriority('Medium');
      setShowAddTask(false);
      toast.success('Task added successfully');
      
      // Refresh project data to update progress
      fetchProject();
    } catch (error) {
      console.error('Error adding task:', error);
      toast.error('Failed to add task');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Done':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'In Progress':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'To Do':
        return <Circle className="w-4 h-4 text-gray-600" />;
      default:
        return <Circle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Done':
        return 'status-done';
      case 'In Progress':
        return 'status-in-progress';
      case 'To Do':
        return 'status-todo';
      default:
        return 'status-todo';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'priority-high';
      case 'Medium':
        return 'priority-medium';
      case 'Low':
        return 'priority-low';
      default:
        return 'priority-medium';
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (taskFilter === 'all') return true;
    return task.status === taskFilter;
  });

  const taskStats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'To Do').length,
    inProgress: tasks.filter(t => t.status === 'In Progress').length,
    done: tasks.filter(t => t.status === 'Done').length
  };

  const progress = taskStats.total > 0 ? (taskStats.done / taskStats.total) * 100 : 0;

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-16">
        <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Project not found</h3>
        <button
          onClick={() => navigate('/projects')}
          className="btn-primary"
        >
          Back to Projects
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/projects')}
            className="mr-4 p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
            <p className="text-gray-600 mt-1">Created {new Date(project.created_at).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button className="btn-secondary">
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </button>
          <button className="btn-secondary">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </button>
          <button className="btn-secondary">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="dashboard-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Progress</p>
              <p className="text-2xl font-semibold text-gray-900">{progress.toFixed(1)}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
          <div className="progress-bar mt-3">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Tasks</p>
              <p className="text-2xl font-semibold text-gray-900">{taskStats.total}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="dashboard-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Completed</p>
              <p className="text-2xl font-semibold text-gray-900">{taskStats.done}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="dashboard-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">In Progress</p>
              <p className="text-2xl font-semibold text-gray-900">{taskStats.inProgress}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: Eye },
            { id: 'tasks', label: 'Tasks', icon: FileText },
            { id: 'flow', label: 'User Flow', icon: ArrowRight },
            { id: 'analysis', label: 'Analysis', icon: BarChart3 }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-3 py-2 border-b-2 text-sm font-medium ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="animate-slide-up">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Project Description */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Project Description</h2>
              <p className="text-gray-700 leading-relaxed">{project.description}</p>
            </div>

            {/* Features */}
            {project.features && project.features.length > 0 && (
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Key Features</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {project.features.map((feature, index) => (
                    <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                      <span className="text-gray-900 capitalize">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Tasks */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Recent Tasks</h2>
                <button
                  onClick={() => setActiveTab('tasks')}
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  View All Tasks
                </button>
              </div>
              <div className="space-y-3">
                {tasks.slice(0, 5).map(task => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      {getStatusIcon(task.status)}
                      <span className="ml-3 text-gray-900">{task.title}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`status-badge ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      <span className={`status-badge ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                    </div>
                  </div>
                ))}
                {tasks.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No tasks yet. Create your first task!</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-6">
            {/* Task Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <select
                  value={taskFilter}
                  onChange={(e) => setTaskFilter(e.target.value)}
                  className="form-input"
                >
                  <option value="all">All Tasks ({taskStats.total})</option>
                  <option value="To Do">To Do ({taskStats.todo})</option>
                  <option value="In Progress">In Progress ({taskStats.inProgress})</option>
                  <option value="Done">Done ({taskStats.done})</option>
                </select>
              </div>
              <button
                onClick={() => setShowAddTask(true)}
                className="btn-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Task
              </button>
            </div>

            {/* Add Task Form */}
            {showAddTask && (
              <div className="card animate-slide-up">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Task</h3>
                <form onSubmit={handleAddTask} className="space-y-4">
                  <div>
                    <label className="form-label">Task Title</label>
                    <input
                      type="text"
                      className="form-input"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      placeholder="Enter task title"
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-textarea"
                      rows={3}
                      value={newTaskDescription}
                      onChange={(e) => setNewTaskDescription(e.target.value)}
                      placeholder="Enter task description"
                    />
                  </div>
                  <div>
                    <label className="form-label">Priority</label>
                    <select
                      className="form-input"
                      value={newTaskPriority}
                      onChange={(e) => setNewTaskPriority(e.target.value)}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => setShowAddTask(false)}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                    >
                      Add Task
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Tasks List */}
            <div className="space-y-4">
              {filteredTasks.map(task => (
                <div key={task.id} className="task-card">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start flex-1">
                      {getStatusIcon(task.status)}
                      <div className="ml-3 flex-1">
                        <h3 className="font-semibold text-gray-900">{task.title}</h3>
                        {task.description && (
                          <p className="text-gray-600 mt-1">{task.description}</p>
                        )}
                        <div className="flex items-center mt-2 space-x-2">
                          <span className={`status-badge ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                          <span className={`status-badge ${getStatusColor(task.status)}`}>
                            {task.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="ml-4">
                      <select
                        value={task.status}
                        onChange={(e) => handleTaskStatusUpdate(task.id, e.target.value)}
                        disabled={updatingTask === task.id}
                        className="form-input text-sm"
                      >
                        <option value="To Do">To Do</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Done">Done</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
              {filteredTasks.length === 0 && (
                <div className="text-center py-8">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
                  <p className="text-gray-500">
                    {taskFilter === 'all' ? 'Create your first task to get started' : `No tasks with status "${taskFilter}"`}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'flow' && (
          <div className="space-y-6">
            {flow ? (
              <>
                <div className="card">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">User Flow</h2>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700">{flow.flow_description}</p>
                  </div>
                </div>
                
                <div className="card">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Flow Steps</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {flow.flow_steps.map((step, index) => (
                      <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-sm font-semibold text-primary-600">{index + 1}</span>
                        </div>
                        <span className="text-gray-900">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="card">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Pages Needed</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {flow.pages_needed.map((page, index) => (
                      <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <FileText className="w-5 h-5 text-blue-600 mr-3" />
                        <span className="text-gray-900">{page}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <ArrowRight className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">User flow not available</h3>
                <p className="text-gray-500">Unable to generate user flow for this project</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="space-y-6">
            {project.validation_scores ? (
              <>
                <div className="card">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">3-Pillar Validation</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <Target className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <h3 className="font-semibold text-gray-900">Market Need</h3>
                      <div className="text-2xl font-bold text-green-600 mt-2">
                        {project.validation_scores.market_need}/10
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${project.validation_scores.market_need * 10}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <Zap className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <h3 className="font-semibold text-gray-900">Technical Feasibility</h3>
                      <div className="text-2xl font-bold text-blue-600 mt-2">
                        {project.validation_scores.technical_feasibility}/10
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${project.validation_scores.technical_feasibility * 10}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                      <h3 className="font-semibold text-gray-900">User Value</h3>
                      <div className="text-2xl font-bold text-purple-600 mt-2">
                        {project.validation_scores.user_value}/10
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full" 
                          style={{ width: `${project.validation_scores.user_value * 10}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {project.validation_scores.feedback && (
                  <div className="card">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">AI Feedback</h2>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-start">
                        <Sparkles className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
                        <p className="text-gray-700">{project.validation_scores.feedback}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {project.validation_scores.suggestions && (
                  <div className="card">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Suggestions</h2>
                    <div className="space-y-2">
                      {project.validation_scores.suggestions.map((suggestion, index) => (
                        <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                          <Lightbulb className="w-5 h-5 text-yellow-600 mr-3" />
                          <span className="text-gray-900">{suggestion}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Analysis not available</h3>
                <p className="text-gray-500">No validation scores available for this project</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetail;