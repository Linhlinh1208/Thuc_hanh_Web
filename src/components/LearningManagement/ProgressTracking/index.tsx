import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  DatePicker,
  InputNumber,
  Input,
  message
} from 'antd';
import moment from 'moment';

const { TextArea } = Input;

interface Progress {
  id: number;
  subjectId: number;
  date: string;
  duration: number;
  content: string;
  notes?: string;
}

interface Props {
  subject: {
    id: number;
    name: string;
  };
}

const ProgressTracking: React.FC<Props> = ({ subject }) => {
  const [progress, setProgress] = useState<Progress[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    // Load progress của môn học từ localStorage
    const savedProgress = localStorage.getItem('learning_progress');
    if (savedProgress) {
      const allProgress = JSON.parse(savedProgress);
      // Lọc theo môn học
      setProgress(allProgress.filter((p: Progress) => p.subjectId === subject.id));
    }
  }, [subject.id]);

  const saveToStorage = (newProgress: Progress[]) => {
    // Load tất cả progress
    const savedProgress = localStorage.getItem('learning_progress');
    const allProgress = savedProgress ? JSON.parse(savedProgress) : [];

    // Lọc bỏ progress của môn học hiện tại
    const otherProgress = allProgress.filter((p: Progress) => p.subjectId !== subject.id);

    // Lưu lại tất cả
    localStorage.setItem('learning_progress', JSON.stringify([...otherProgress, ...newProgress]));
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const newProgress: Progress = {
        id: editingId || Date.now(),
        subjectId: subject.id,
        date: values.date.format('YYYY-MM-DD HH:mm:ss'),
        duration: values.duration,
        content: values.content,
        notes: values.notes
      };

      let updatedProgress;
      if (editingId) {
        updatedProgress = progress.map(p =>
          p.id === editingId ? newProgress : p
        );
      } else {
        updatedProgress = [...progress, newProgress];
      }

      setProgress(updatedProgress);
      saveToStorage(updatedProgress);
      setIsModalVisible(false);
      form.resetFields();
      setEditingId(null);
      message.success(`${editingId ? 'Cập nhật' : 'Thêm'} tiến độ thành công!`);
    } catch (error) {
      console.error('Validate Failed:', error);
    }
  };

  const handleEdit = (record: Progress) => {
    setEditingId(record.id);
    form.setFieldsValue({
      ...record,
      date: moment(record.date)
    });
    setIsModalVisible(true);
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc muốn xóa tiến độ này?',
      onOk: () => {
        const updatedProgress = progress.filter(p => p.id !== id);
        setProgress(updatedProgress);
        saveToStorage(updatedProgress);
        message.success('Xóa tiến độ thành công!');
      },
    });
  };

  const columns = [
    {
      title: 'Thời gian',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => moment(date).format('DD/MM/YYYY HH:mm'),
      sorter: (a, b) => moment(a.date).unix() - moment(b.date).unix()
    },
    {
      title: 'Thời lượng (phút)',
      dataIndex: 'duration',
      key: 'duration'
    },
    {
      title: 'Nội dung học',
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
      render: (_: any, record: Progress) => (
        <Space size="middle">
          <Button type="link" onClick={() => handleEdit(record)}>
            Sửa
          </Button>
          <Button type="link" danger onClick={() => handleDelete(record.id)}>
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Button
        type="primary"
        onClick={() => {
          setEditingId(null);
          form.resetFields();
          setIsModalVisible(true);
        }}
        style={{ marginBottom: 16 }}
      >
        Thêm tiến độ
      </Button>

      <Table
        columns={columns}
        dataSource={progress}
        rowKey="id"
      />

      <Modal
        title={editingId ? "Sửa tiến độ" : "Thêm tiến độ"}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingId(null);
          form.resetFields();
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="date"
            label="Thời gian học"
            rules={[{ required: true, message: 'Vui lòng chọn thời gian!' }]}
          >
            <DatePicker
              showTime
              format="DD/MM/YYYY HH:mm"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="duration"
            label="Thời lượng (phút)"
            rules={[{ required: true, message: 'Vui lòng nhập thời lượng!' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="content"
            label="Nội dung đã học"
            rules={[{ required: true, message: 'Vui lòng nhập nội dung!' }]}
          >
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name="notes"
            label="Ghi chú"
          >
            <TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProgressTracking;
