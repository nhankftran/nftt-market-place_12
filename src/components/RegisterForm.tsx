// src/components/RegisterForm.tsx
"use client"; // Dùng để đánh dấu đây là Client Component trong Next.js App Router

import React, { useState, FormEvent } from 'react';

// Định nghĩa kiểu dữ liệu cho form
interface RegistrationFormData {
  name: string;
  dob: string; // YYYY-MM-DD
  gender: 'male' | 'female' | 'other' | '';
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed' | '';
}

// Định nghĩa props cho component, ví dụ có thể nhận một hàm onSubmit để xử lý dữ liệu
interface RegisterFormProps {
  onSubmit: (data: RegistrationFormData) => Promise<void>;
  isLoading: boolean; // Để kiểm soát trạng thái loading khi gửi form
  error: string | null; // Để hiển thị lỗi từ API
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSubmit, isLoading, error }) => {
  const [formData, setFormData] = useState<RegistrationFormData>({
    name: '',
    dob: '',
    gender: '',
    maritalStatus: '',
  });

  // Xử lý thay đổi input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Xử lý submit form
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    // Bạn có thể thêm các kiểm tra validate form ở đây trước khi gửi
    if (!formData.name || !formData.dob || !formData.gender || !formData.maritalStatus) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }
    await onSubmit(formData);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Đăng Ký Tài Khoản</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Trường Tên */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Tên của bạn:
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="VD: Nguyễn Văn A"
          />
        </div>

        {/* Trường Ngày tháng năm sinh */}
        <div>
          <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-1">
            Ngày tháng năm sinh:
          </label>
          <input
            type="date"
            id="dob"
            name="dob"
            value={formData.dob}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        {/* Trường Giới tính */}
        <div>
          <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
            Giới tính:
          </label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="" disabled>Chọn giới tính</option>
            <option value="male">Nam</option>
            <option value="female">Nữ</option>
            <option value="other">Khác</option>
          </select>
        </div>

        {/* Trường Tình trạng hôn nhân */}
        <div>
          <label htmlFor="maritalStatus" className="block text-sm font-medium text-gray-700 mb-1">
            Tình trạng hôn nhân:
          </label>
          <select
            id="maritalStatus"
            name="maritalStatus"
            value={formData.maritalStatus}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="" disabled>Chọn tình trạng</option>
            <option value="single">Độc thân</option>
            <option value="married">Đã kết hôn</option>
            <option value="divorced">Đã ly hôn</option>
            <option value="widowed">Góa phụ</option>
          </select>
        </div>

        {/* Hiển thị lỗi từ API */}
        {error && (
          <p className="text-red-600 text-sm mt-2">{error}</p>
        )}

        {/* Nút Đăng ký */}
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
            isLoading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
          }`}
        >
          {isLoading ? 'Đang đăng ký...' : 'Đăng Ký'}
        </button>
      </form>
    </div>
  );
};

export default RegisterForm;