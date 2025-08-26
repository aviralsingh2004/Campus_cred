import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { adminAPI, handleAPIError } from '../utils/apiServices';
import { 
  SearchIcon,
  UserIcon,
  CreditCardIcon,
  CheckCircleIcon,
  AlertCircleIcon
} from 'lucide-react';

const AdminCredit = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('Treasury credit');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const res = await adminAPI.getAllStudents();
        setStudents(res.data.students || []);
      } catch (err) {
        const e = handleAPIError(err);
        setMessage({ type: 'error', text: e.message });
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const filteredStudents = useMemo(() => {
    if (!search.trim()) return students;
    const q = search.toLowerCase();
    return students.filter(s => 
      (s.first_name + ' ' + s.last_name).toLowerCase().includes(q) ||
      (s.email || '').toLowerCase().includes(q) ||
      (s.student_id || '').toLowerCase().includes(q)
    );
  }, [students, search]);

  const canSubmit = selectedStudent && Number(amount) > 0 && reason.trim();

  const submitCredit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await adminAPI.addPoints(selectedStudent.id, Number(amount), reason.trim());
      setMessage({ type: 'success', text: `Credited ${res.data.transaction.amount} points to ${selectedStudent.first_name} ${selectedStudent.last_name}` });
      setStudents(prev => prev.map(s => s.id === selectedStudent.id ? { ...s, points_balance: res.data.user.new_balance } : s));
      setAmount('');
      setReason('Treasury credit');
    } catch (err) {
      const e = handleAPIError(err);
      setMessage({ type: 'error', text: e.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Credit Points</h1>
      </div>

      {message && (
        <div className={message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800 rounded-md p-3 mb-4' : 'bg-red-50 border border-red-200 text-red-800 rounded-md p-3 mb-4'}>
          <div className="flex items-center gap-2">
            {message.type === 'success' ? <CheckCircleIcon className="h-5 w-5" /> : <AlertCircleIcon className="h-5 w-5" />}
            <span className="text-sm">{message.text}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Search by name, email, or student ID"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="divide-y divide-gray-100 max-h-[520px] overflow-y-auto">
            {loading ? (
              <div className="p-6 text-sm text-gray-500">Loading students...</div>
            ) : filteredStudents.length === 0 ? (
              <div className="p-6 text-sm text-gray-500">No students found</div>
            ) : (
              filteredStudents.map(s => (
                <button key={s.id} onClick={() => setSelectedStudent(s)} className={`w-full text-left p-4 hover:bg-gray-50 ${selectedStudent?.id === s.id ? 'bg-primary-50' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-medium">
                        {(s.first_name?.[0] || '?').toUpperCase()}{(s.last_name?.[0] || '').toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{s.first_name} {s.last_name} {s.student_id && <span className="text-gray-500">• {s.student_id}</span>}</p>
                        <p className="text-xs text-gray-500">{s.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-primary-600">{s.points_balance}</p>
                      <p className="text-xs text-gray-500">points</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Treasury Credit</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Selected Student</label>
              {selectedStudent ? (
                <div className="flex items-center gap-2 text-sm text-gray-900">
                  <UserIcon className="h-4 w-4" />
                  <span>{selectedStudent.first_name} {selectedStudent.last_name} {selectedStudent.student_id && `• ${selectedStudent.student_id}`}</span>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Pick a student from the list</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
              <input
                type="number"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Enter points to credit"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="e.g. Academic Excellence Bonus"
              />
            </div>

            <button
              onClick={submitCredit}
              disabled={!canSubmit || submitting}
              className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md text-white ${(!canSubmit || submitting) ? 'bg-primary-400' : 'bg-primary-600 hover:bg-primary-700'}`}
            >
              <CreditCardIcon className="h-4 w-4" />
              {submitting ? 'Crediting...' : 'Credit Points'}
            </button>
            <p className="text-xs text-gray-500">This will create a credit transaction and update the student's balance.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCredit;



