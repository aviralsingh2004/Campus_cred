import React, { useState, useEffect } from 'react';
import { 
  SearchIcon, 
  CreditCardIcon, 
  UserIcon, 
  CheckIcon,
  AlertCircleIcon,
  DollarSignIcon,
  MailIcon,
  IdCardIcon
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [creditAmount, setCreditAmount] = useState('');
  const [creditReason, setCreditReason] = useState('');
  const [creditLoading, setCreditLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [adminBalance, setAdminBalance] = useState(0);

  // Fetch all students and admin balance on component mount
  useEffect(() => {
    fetchStudents();
    fetchAdminBalance();
  }, []);

  // Search students when query changes
  useEffect(() => {
    if (searchQuery.trim()) {
      searchStudents();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const fetchAdminBalance = async () => {
    try {
      const token = localStorage.getItem('campus_cred_token');
      const response = await fetch('/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAdminBalance(data.user.points_balance || 0);
      }
    } catch (error) {
      console.error('Error fetching admin balance:', error);
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('campus_cred_token');
      const response = await fetch('/api/admin/students', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStudents(data.students || []);
      } else {
        setMessage({ type: 'error', text: 'Failed to fetch students' });
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      setMessage({ type: 'error', text: 'Error fetching students' });
    } finally {
      setLoading(false);
    }
  };

  const searchStudents = () => {
    const query = searchQuery.toLowerCase().trim();
    const results = students.filter(student => 
      student.email.toLowerCase().includes(query) ||
      student.student_id.toLowerCase().includes(query) ||
      student.id.toString().includes(query) ||
      `${student.first_name} ${student.last_name}`.toLowerCase().includes(query)
    );
    setSearchResults(results);
  };

  const handleSelectStudent = (student) => {
    setSelectedStudent(student);
    setSearchQuery('');
    setSearchResults([]);
    setMessage({ type: '', text: '' });
  };

  const handleCreditPoints = async (e) => {
    e.preventDefault();
    
    if (!selectedStudent || !creditAmount || !creditReason.trim()) {
      setMessage({ type: 'error', text: 'Please fill in all fields' });
      return;
    }

    const amount = parseFloat(creditAmount);
    if (isNaN(amount) || amount <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid positive amount' });
      return;
    }

    setCreditLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('campus_cred_token');
      const response = await fetch(`/api/admin/students/${selectedStudent.id}/add-points`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: amount,
          reason: creditReason.trim()
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMessage({ 
          type: 'success', 
          text: `Successfully transferred ${amount} points to ${selectedStudent.first_name} ${selectedStudent.last_name}. Admin balance: ${data.admin.new_balance}` 
        });
        
        // Update the selected student's balance
        setSelectedStudent(prev => ({
          ...prev,
          points_balance: data.student.new_balance
        }));

        // Update admin balance
        setAdminBalance(data.admin.new_balance);

        // Reset form
        setCreditAmount('');
        setCreditReason('');
        setShowCreditModal(false);

        // Refresh students list
        fetchStudents();
      } else {
        const error = await response.json();
        setMessage({ 
          type: 'error', 
          text: error.error || error.message || 'Failed to credit points',
          adminBalance: error.adminBalance || null,
          requiredAmount: error.requiredAmount || null
        });
      }
    } catch (error) {
      console.error('Error crediting points:', error);
      setMessage({ type: 'error', text: 'Error processing credit request' });
    } finally {
      setCreditLoading(false);
    }
  };

  const clearSelection = () => {
    setSelectedStudent(null);
    setSearchQuery('');
    setSearchResults([]);
    setCreditAmount('');
    setCreditReason('');
    setMessage({ type: '', text: '' });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Management</h1>
        <p className="text-gray-600">Search for students and manage their point balances</p>
        
        {/* Admin Balance Display */}
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center">
            <DollarSignIcon className="h-5 w-5 text-blue-600 mr-2" />
            <span className="text-blue-800 font-medium">
              Admin Balance: {adminBalance.toLocaleString()} points
            </span>
          </div>
        </div>
      </div>

      {/* Message Display */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-lg border ${
          message.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center">
            {message.type === 'success' ? (
              <CheckIcon className="h-5 w-5 mr-2" />
            ) : (
              <AlertCircleIcon className="h-5 w-5 mr-2" />
            )}
            <div>
              <div>{message.text}</div>
              {message.type === 'error' && message.adminBalance !== undefined && (
                <div className="mt-2 text-sm">
                  <div>Available admin balance: {message.adminBalance} points</div>
                  {message.requiredAmount && (
                    <div>Requested amount: {message.requiredAmount} points</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Search Section */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Search Students</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search by Email, Student ID, User ID, or Name
            </label>
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter email, student ID, user ID, or name..."
                className="pl-10"
              />
            </div>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Found {searchResults.length} student(s):
              </p>
              {searchResults.map((student) => (
                <div
                  key={student.id}
                  onClick={() => handleSelectStudent(student)}
                  className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        {student.first_name} {student.last_name}
                      </p>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center">
                          <MailIcon className="h-3 w-3 mr-1" />
                          {student.email}
                        </div>
                        <div className="flex items-center">
                          <IdCardIcon className="h-3 w-3 mr-1" />
                          Student ID: {student.student_id} | User ID: {student.id}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-blue-600">
                        {student.points_balance} pts
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {searchQuery && searchResults.length === 0 && (
            <p className="text-gray-500 text-sm">No students found matching your search.</p>
          )}
        </Card>

        {/* Selected Student & Credit Section */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Credit Points</h2>
          
          {selectedStudent ? (
            <div>
              {/* Selected Student Info */}
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Selected Student</h3>
                <div className="space-y-2">
                  <p className="text-lg font-medium text-gray-900">
                    {selectedStudent.first_name} {selectedStudent.last_name}
                  </p>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex items-center">
                      <MailIcon className="h-4 w-4 mr-2" />
                      {selectedStudent.email}
                    </div>
                    <div className="flex items-center">
                      <IdCardIcon className="h-4 w-4 mr-2" />
                      Student ID: {selectedStudent.student_id}
                    </div>
                    <div className="flex items-center">
                      <UserIcon className="h-4 w-4 mr-2" />
                      User ID: {selectedStudent.id}
                    </div>
                    <div className="flex items-center">
                      <CreditCardIcon className="h-4 w-4 mr-2" />
                      Current Balance: <span className="font-semibold ml-1">{selectedStudent.points_balance} points</span>
                    </div>
                  </div>
                </div>
                
                <Button
                  onClick={clearSelection}
                  variant="secondary"
                  className="mt-3"
                >
                  Clear Selection
                </Button>
              </div>

              {/* Credit Form */}
              <form onSubmit={handleCreditPoints} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Credit Amount (Points)
                  </label>
                  <Input
                    type="number"
                    value={creditAmount}
                    onChange={(e) => setCreditAmount(e.target.value)}
                    placeholder="Enter points to credit"
                    min="1"
                    step="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason for Credit
                  </label>
                  <textarea
                    value={creditReason}
                    onChange={(e) => setCreditReason(e.target.value)}
                    placeholder="Enter reason for crediting points..."
                    className="w-full border border-gray-300 rounded-md px-3 py-2 h-24 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={creditLoading || !creditAmount || !creditReason.trim()}
                  className="w-full"
                >
                  {creditLoading ? (
                    <div className="flex items-center justify-center">
                      <LoadingSpinner size="sm" />
                      <span className="ml-2">Processing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <DollarSignIcon className="h-4 w-4 mr-2" />
                      Credit {creditAmount || '0'} Points
                    </div>
                  )}
                </Button>
              </form>
            </div>
          ) : (
            <div className="text-center py-8">
              <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No student selected</p>
              <p className="text-sm text-gray-400">
                Search and select a student to credit points to their account
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Recent Students Table */}
      <Card className="mt-8 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">All Students</h2>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Points Balance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.slice(0, 10).map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {student.first_name} {student.last_name}
                        </p>
                        <p className="text-sm text-gray-500">{student.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.student_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-lg font-semibold text-blue-600">
                        {student.points_balance} pts
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Button
                        onClick={() => handleSelectStudent(student)}
                        variant="secondary"
                        className="text-sm"
                      >
                        Select
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {students.length > 10 && (
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500">
                  Showing 10 of {students.length} students. Use search to find specific students.
                </p>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminStudents;
