import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import {
  ArrowLeft,
  Sparkles,
  Target,
  BarChart3,
  Lightbulb,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Users,
  Zap,
  Shield,
  RefreshCw,
  Eye,
  Edit,
  Save,
  Send,
  Info,
  HelpCircle
} from 'lucide-react';

const CreateProject = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.description.length < 50) {
      toast.error('Please provide a more detailed description (at least 50 characters)');
      return;
    }

    setLoading(true);
    
    try {
      const response = await axios.post('/api/projects', formData);
      toast.success('Project created successfully!');
      navigate(`/projects/${response.data.project.id}`);
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error(error.response?.data?.detail || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const getAnalysisPreview = () => {
    const wordCount = formData.description.split(' ').length;
    const hasKeywords = ['saas', 'software', 'platform', 'application', 'app', 'service', 'tool', 'solution'].some(
      keyword => formData.description.toLowerCase().includes(keyword)
    );
    
    // Mock analysis preview based on description
    const mockAnalysis = {
      market_need: Math.min(10, Math.max(3, wordCount / 10 + (hasKeywords ? 2 : 0))),
      technical_feasibility: Math.min(10, Math.max(4, 8 - (formData.description.toLowerCase().includes('ai') ? 2 : 0))),
      user_value: Math.min(10, Math.max(3, wordCount / 15 + (hasKeywords ? 1 : 0))),
      estimated_features: Math.min(8, Math.max(3, wordCount / 20)),
      estimated_tasks: Math.min(20, Math.max(5, wordCount / 8))
    };
    
    return mockAnalysis;
  };

  const previewAnalysis = getAnalysisPreview();

  return (
    <div className="animate-fade-in">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/projects')}
          className="mr-4 p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="section-title">Create New Project</h1>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="space-y-6">
            <div className="card">
              <div className="flex items-center mb-4">
                <Sparkles className="w-6 h-6 text-primary-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">Describe Your SaaS Idea</h2>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="title" className="form-label">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    required
                    className="form-input"
                    placeholder="e.g., Task Management Platform for Remote Teams"
                    value={formData.title}
                    onChange={handleInputChange}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Give your project a clear, descriptive title
                  </p>
                </div>

                <div>
                  <label htmlFor="description" className="form-label">
                    Project Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    required
                    rows={10}
                    className="form-textarea"
                    placeholder="Describe your SaaS idea in detail. Include:
• What problem does it solve?
• Who is your target audience?
• What are the key features?
• How will users benefit from it?
• What makes it unique?

Example: A comprehensive task management platform designed for remote teams. It helps distributed teams collaborate effectively by providing real-time task tracking, video integration, time tracking, and performance analytics. The platform addresses the challenge of maintaining productivity and communication in remote work environments..."
                    value={formData.description}
                    onChange={handleInputChange}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-sm text-gray-500">
                      {formData.description.length}/500 characters (min: 50)
                    </p>
                    <div className="flex items-center space-x-2">
                      {formData.description.length >= 50 && (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      )}
                      {formData.description.length < 50 && formData.description.length > 0 && (
                        <AlertCircle className="w-4 h-4 text-yellow-600" />
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className="btn-secondary flex items-center justify-center"
                    disabled={!formData.title || formData.description.length < 50}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    {showPreview ? 'Hide Preview' : 'Preview Analysis'}
                  </button>
                  
                  <button
                    type="submit"
                    disabled={loading || !formData.title || formData.description.length < 50}
                    className="btn-primary flex items-center justify-center flex-1"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Creating Project...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Create Project
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Tips Section */}
            <div className="card bg-blue-50 border-blue-200">
              <div className="flex items-start">
                <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">Tips for Better Analysis</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Be specific about the problem you're solving</li>
                    <li>• Clearly define your target audience</li>
                    <li>• List key features and functionality</li>
                    <li>• Explain what makes your solution unique</li>
                    <li>• Include potential business model ideas</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Preview Section */}
          <div className="space-y-6">
            {showPreview && formData.description.length >= 50 && (
              <div className="card animate-slide-up">
                <div className="flex items-center mb-4">
                  <BarChart3 className="w-6 h-6 text-primary-600 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-900">Analysis Preview</h2>
                </div>
                
                {/* 3-Pillar Validation */}
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">3-Pillar Validation</h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Target className="w-4 h-4 text-green-600 mr-2" />
                          <span className="text-sm font-medium">Market Need</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${previewAnalysis.market_need * 10}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold">{previewAnalysis.market_need}/10</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Zap className="w-4 h-4 text-blue-600 mr-2" />
                          <span className="text-sm font-medium">Technical Feasibility</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${previewAnalysis.technical_feasibility * 10}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold">{previewAnalysis.technical_feasibility}/10</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Users className="w-4 h-4 text-purple-600 mr-2" />
                          <span className="text-sm font-medium">User Value</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-purple-600 h-2 rounded-full" 
                              style={{ width: `${previewAnalysis.user_value * 10}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold">{previewAnalysis.user_value}/10</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Estimated Project Scope</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900">{previewAnalysis.estimated_features}</div>
                        <div className="text-sm text-gray-500">Core Features</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900">{previewAnalysis.estimated_tasks}</div>
                        <div className="text-sm text-gray-500">Development Tasks</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* What happens next */}
            <div className="card">
              <div className="flex items-center mb-4">
                <TrendingUp className="w-6 h-6 text-green-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">What Happens Next?</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-xs font-semibold text-primary-600">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">AI Analysis</h3>
                    <p className="text-sm text-gray-600">Our AI will analyze your idea and provide detailed feedback on market potential, technical feasibility, and user value.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-xs font-semibold text-primary-600">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Feature Extraction</h3>
                    <p className="text-sm text-gray-600">We'll identify key features from your description and organize them into a structured plan.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-xs font-semibold text-primary-600">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Task Generation</h3>
                    <p className="text-sm text-gray-600">Convert features into actionable development tasks with priorities and descriptions.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-xs font-semibold text-primary-600">4</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Project Dashboard</h3>
                    <p className="text-sm text-gray-600">Access your personalized project dashboard with progress tracking and AI suggestions.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Example Projects */}
            <div className="card bg-gray-50">
              <div className="flex items-center mb-4">
                <FileText className="w-6 h-6 text-gray-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">Example Projects</h2>
              </div>
              
              <div className="space-y-3">
                <div className="p-3 bg-white rounded-lg border">
                  <h3 className="font-semibold text-gray-900 text-sm">Team Collaboration Platform</h3>
                  <p className="text-xs text-gray-600 mt-1">A comprehensive platform for remote team collaboration with real-time messaging, file sharing, and project tracking.</p>
                </div>
                
                <div className="p-3 bg-white rounded-lg border">
                  <h3 className="font-semibold text-gray-900 text-sm">Invoice Management System</h3>
                  <p className="text-xs text-gray-600 mt-1">Automated invoicing and billing system for small businesses with payment tracking and client management.</p>
                </div>
                
                <div className="p-3 bg-white rounded-lg border">
                  <h3 className="font-semibold text-gray-900 text-sm">Learning Management System</h3>
                  <p className="text-xs text-gray-600 mt-1">Online learning platform with course creation, progress tracking, and interactive assessments.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateProject;