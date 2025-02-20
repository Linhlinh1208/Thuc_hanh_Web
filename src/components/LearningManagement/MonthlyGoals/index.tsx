import React, { useState, useEffect } from 'react';
import { Table, Button,  Space,  Modal,  Form,  Select,  InputNumber, Progress, message } from 'antd';
import { DatePicker } from 'antd';
import { TimePicker, Input } from 'antd';
import moment from 'moment';
import './index.less';

import { Tabs } from 'antd';
const { TabPane } = Tabs;

interface Goal {
  id: number;
  subjectId: number;
  targetHours: number;
  month: number;
  year: number;
}

interface Subject {
  id: number;
  name: string;
}

interface LearningProgress {
  id: number;
  subjectId: number;
  duration: number;
  date: string;
  content: string;
  notes: string;
  time: string;
}

const MonthlyGoals: React.FC = () => {
  // States
  const [goals, setGoals] = useState<Goal[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [progress, setProgress] = useState<LearningProgress[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [isSessionModalVisible, setIsSessionModalVisible] = useState(false);
  const [sessionForm] = Form.useForm();
  const [editingSessionId, setEditingSessionId] = useState<number | null>(null);

  const currentMonth = moment().month() + 1;
  const currentYear = moment().year();

  const [sessions, setSessions] = useState<LearningProgress[]>([]);
  // Load dữ liệu khi component mount
  useEffect(() => {
    setLoading(true);
    try {
      const savedSubjects = localStorage.getItem('learning_subjects');
      const savedGoals = localStorage.getItem('monthly_goals');
      const savedProgress = localStorage.getItem('learning_progress');
      const savedSessions = localStorage.getItem('learning_sessions');

      if (savedSubjects) setSubjects(JSON.parse(savedSubjects));
      if (savedGoals) setGoals(JSON.parse(savedGoals));
      if (savedProgress) setProgress(JSON.parse(savedProgress));
      if (savedSessions) setSessions(JSON.parse(savedSessions));
    } catch (error) {
      message.error('Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, []);

  // Lưu vào localStorage
  const saveToStorage = (data: Goal[]) => {
    localStorage.setItem('monthly_goals', JSON.stringify(data));
  };

  // Tính toán tiến độ
  const calculateProgress = (goal: Goal) => {
    const monthProgress = progress.filter(p => {
      const date = moment(p.date);
      return p.subjectId === goal.subjectId &&
date.month() + 1 === goal.month &&
date.year() === goal.year;
    });

    const totalMinutes = monthProgress.reduce((sum, p) => sum + p.duration, 0);
    const totalHours = totalMinutes / 60;
    const percentage = Math.min(Math.round((totalHours / goal.targetHours) * 100), 100);

    return {
      hours: totalHours.toFixed(1),
      percentage
    };
  };
  const handleSessionSubmit = async () => {
    try {
      const values = await sessionForm.validateFields();
      const newSession: LearningProgress = {
        id: editingSessionId || Date.now(),
        subjectId: selectedSubject?.id || 0,
        date: values.date.format('YYYY-MM-DD'),
        time: values.time.format('HH:mm'),
        duration: values.duration,
        content: values.content,
        notes: values.notes || ''
      };

      let updatedSessions;
      if (editingSessionId) {
        updatedSessions = sessions.map(session =>
          session.id === editingSessionId ? newSession : session
        );
      } else {
        updatedSessions = [...sessions, newSession];
      }

      setSessions(updatedSessions);
      localStorage.setItem('learning_sessions', JSON.stringify(updatedSessions));
      setIsSessionModalVisible(false);
      sessionForm.resetFields();
      setEditingSessionId(null);
      message.success(`${editingSessionId ? 'Cập nhật' : 'Thêm'} tiến độ thành công!`);
    } catch (error) {
      console.error('Validate Failed:', error);
    }
  };
  // Xử lý submit form
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const newGoal: Goal = {
        id: editingId || Date.now(),
        subjectId: values.subjectId,
        targetHours: values.targetHours,
        month: values.month || currentMonth,
        year: values.year || currentYear
      };

      // Kiểm tra trùng lặp
      const existingGoal = goals.find(g =>
        g.subjectId === newGoal.subjectId &&
        g.month === newGoal.month &&
        g.year === newGoal.year &&
        g.id !== newGoal.id
      );

      if (existingGoal) {
        message.error('Đã có mục tiêu cho môn học này trong tháng!');
        return;
      }

      let updatedGoals;
      if (editingId) {
        updatedGoals = goals.map(goal =>
          goal.id === editingId ? newGoal : goal
        );
      } else {
        updatedGoals = [...goals, newGoal];
      }

      setGoals(updatedGoals);
      saveToStorage(updatedGoals);
      setIsModalVisible(false);
      form.resetFields();
      setEditingId(null);
      message.success(`${editingId ? 'Cập nhật' : 'Thêm'} mục tiêu thành công!`);
    } catch (error) {
      console.error('Validate Failed:', error);
    }
  };

  // Xử lý sửa
  const handleEdit = (record: Goal) => {
    setEditingId(record.id);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  // Xử lý xóa
  const handleDelete = (id: number) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc muốn xóa mục tiêu này?',
      onOk: () => {
        const updatedGoals = goals.filter(goal => goal.id !== id);
        setGoals(updatedGoals);
        saveToStorage(updatedGoals);
        message.success('Xóa mục tiêu thành công!');
      },
    });
  };

  // Định nghĩa columns cho Table
  const columns = [
    {
      title: 'Môn học',
      dataIndex: 'subjectId',
      key: 'subjectId',
      render: (subjectId: number) => {
        const subject = subjects.find(s => s.id === subjectId);
        return (
          <Button
            type="link"
            onClick={() => setSelectedSubject(subject || null)}
          >
            {subject?.name || ''}
          </Button>
        );
      }
    },
    {
      title: 'Thời gian',
      key: 'time',
      render: (_: unknown, record: Goal) => `Tháng ${record.month}/${record.year}`
    },
    {
      title: 'Mục tiêu (giờ)',
      dataIndex: 'targetHours',
      key: 'targetHours'
    },
    {
      title: 'Tiến độ',
      key: 'progress',
      render: (_: unknown, record: Goal) => {
        const { hours, percentage } = calculateProgress(record);
        return (
          <Space direction="vertical" style={{ width: '100%' }}>
            <Progress percent={percentage} size="small" />
            <span>{hours} / {record.targetHours} giờ</span>
          </Space>
        );
      }
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: unknown, record: Goal) => (
        <Space size="middle">
          <Button type="link" onClick={() => handleEdit(record)}>
            Sửa
          </Button>
          <Button type="link" danger onClick={() => handleDelete(record.id)}>
            Xóa
          </Button>
        </Space>
      ),
    }
  ];
  const handleEditSession = (record: LearningProgress) => {
    setEditingSessionId(record.id);
    sessionForm.setFieldsValue({
      ...record,
      date: moment(record.date)
    });
    setIsSessionModalVisible(true);
  };

  const handleDeleteSession = (id: number) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc muốn xóa tiến độ học tập này?',
      onOk: () => {
        const updatedSessions = sessions.filter(s => s.id !== id);
        setSessions(updatedSessions);
        localStorage.setItem('learning_sessions', JSON.stringify(updatedSessions));
        message.success('Xóa tiến độ thành công!');
      }
    });
  };
  const sessionColumns = [
    {
      title: 'Ngày học',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => moment(date).format('DD/MM/YYYY')
    },
    {
      title: 'Giờ học',
      dataIndex: 'time',
      key: 'time'
    },
    {
      title: 'Thời lượng (phút)',
      dataIndex: 'duration',
      key: 'duration'
    },
    {
      title: 'Nội dung đã học',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true
    },
    {
      title: 'Ghi chú',
      dataIndex: 'notes',
      key: 'notes',
      ellipsis: true
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: unknown, record: LearningProgress) => (
        <Space size="middle">
          <Button type="link" onClick={() => handleEditSession(record)}>
            Sửa
          </Button>
          <Button type="link" danger onClick={() => handleDeleteSession(record.id)}>
            Xóa
          </Button>
        </Space>
      ),
    }
  ];
  const LearningProgressModal = () => {
    const subjectSessions = sessions.filter(s => s.subjectId === selectedSubject?.id);

    return (
      <Modal
        title={`Tiến độ học tập - ${selectedSubject?.name}`}
        visible={!!selectedSubject}
        onCancel={() => setSelectedSubject(null)}
        width={800}
        footer={null}
      >
        <div className="header" style={{ marginBottom: 16 }}>
          <Button
            type="primary"
            onClick={() => {
              sessionForm.setFieldsValue({ subjectId: selectedSubject?.id });
              setIsSessionModalVisible(true);
            }}
          >
            Thêm tiến độ
          </Button>
        </div>

        <Table
          columns={sessionColumns}
          dataSource={subjectSessions}
          rowKey="id"
          pagination={{
            defaultPageSize: 5,
            showTotal: (total) => `Tổng số ${total} buổi học`
          }}
        />
      </Modal>
    );
  };
  const modalProps = {
    title: editingId ? "Sửa mục tiêu" : "Thêm mục tiêu",
    visible: isModalVisible,
    onOk: handleSubmit,
    onCancel: () => {
      setIsModalVisible(false);
      setEditingId(null);
      form.resetFields();
    }
  };

  const formProps = {
    form: form,
    layout: 'vertical' as const,
    children: (
      <>
        <Form.Item
          name="subjectId"
          label="Môn học"
          rules={[{ required: true, message: 'Vui lòng chọn môn học!' }]}
        >
          <Select>
            {subjects.map(subject => (
              <Select.Option key={subject.id} value={subject.id}>
                {subject.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="targetHours"
          label="Số giờ mục tiêu"
          rules={[
            { required: true, message: 'Vui lòng nhập số giờ mục tiêu!' },
            { type: 'number', min: 1, message: 'Số giờ phải lớn hơn 0!' },
            { type: 'number', max: 1000, message: 'Số giờ không được vượt quá 1000!' }
          ]}
        >
          <InputNumber min={1} max={1000} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="month"
          label="Tháng"
          initialValue={currentMonth}
        >
          <Select>
            {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
              <Select.Option key={month} value={month}>
                Tháng {month}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="year"
          label="Năm"
          initialValue={currentYear}
        >
          <InputNumber style={{ width: '100%' }} />
        </Form.Item>
      </>
    )
  };

  return (
    <div className="monthlyGoals">
      <Tabs defaultActiveKey="1">
        <TabPane tab="Mục tiêu theo tháng" key="1">
          <div className="header">
            <Button
              type="primary"
              onClick={() => {
                setEditingId(null);
                form.resetFields();
                setIsModalVisible(true);
              }}
            >
              Thêm mục tiêu
            </Button>
          </div>

          <Table
            loading={loading}
            columns={columns}
            dataSource={goals}
            rowKey="id"
            pagination={{
              defaultPageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng số ${total} mục tiêu`
            }}
          />

          <Modal {...modalProps}>
            <Form {...formProps} />
          </Modal>
          <LearningProgressModal />

          <Modal
  title={editingSessionId ? "Sửa tiến độ học tập" : "Thêm tiến độ học tập"}
  visible={isSessionModalVisible}
  onOk={handleSessionSubmit}
  onCancel={() => {
    setIsSessionModalVisible(false);
    sessionForm.resetFields();
    setEditingSessionId(null);
  }}
  width={600}
>
  <Form form={sessionForm} layout="vertical">
    <Form.Item
      name="date"
      label="Ngày học"
      rules={[{ required: true, message: 'Vui lòng chọn ngày học!' }]}
    >
      <DatePicker style={{ width: '100%' }} />
    </Form.Item>

    <Form.Item
      name="time"
      label="Giờ học"
      rules={[{ required: true, message: 'Vui lòng nhập giờ học!' }]}
    >
      <TimePicker format="HH:mm" style={{ width: '100%' }} />
    </Form.Item>

    <Form.Item
      name="duration"
      label="Thời lượng (phút)"
      rules={[
        { required: true, message: 'Vui lòng nhập thời lượng!' },
        { type: 'number', min: 1, message: 'Thời lượng phải lớn hơn 0!' }
      ]}
    >
      <InputNumber min={1} style={{ width: '100%' }} />
    </Form.Item>

    <Form.Item
      name="content"
      label="Nội dung đã học"
      rules={[{ required: true, message: 'Vui lòng nhập nội dung đã học!' }]}
    >
      <Input.TextArea rows={4} />
    </Form.Item>

    <Form.Item
      name="notes"
      label="Ghi chú"
    >
      <Input.TextArea rows={3} />
    </Form.Item>
  </Form>
</Modal>
  </TabPane>

        <TabPane tab="Tiến độ học tập" key="2">
          <Table
            loading={loading}
            columns={sessionColumns}
            dataSource={sessions}
            rowKey="id"
            pagination={{
              defaultPageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng số ${total} buổi học`
            }}
          />
        </TabPane>

        <TabPane tab="Thống kê" key="3">
          <div style={{ padding: '20px' }}>
            <h3>Thống kê theo môn học</h3>
            {subjects.map(subject => {
              const subjectGoals = goals.filter(g => g.subjectId === subject.id);
              const subjectSessions = sessions.filter(s => s.subjectId === subject.id);
              const totalMinutes = subjectSessions.reduce((sum, s) => sum + s.duration, 0);
              const totalHours = (totalMinutes / 60).toFixed(1);

              return (
                <div key={subject.id} style={{ marginBottom: '20px' }}>
                  <h4>{subject.name}</h4>
                  <p>Tổng thời gian học: {totalHours} giờ</p>
                  <p>Số buổi học: {subjectSessions.length}</p>
                  <p>Số mục tiêu đã đặt: {subjectGoals.length}</p>
                </div>
              );
            })}
          </div>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default MonthlyGoals;
