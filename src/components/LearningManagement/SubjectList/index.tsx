import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, message } from 'antd';
import styles from './index.less';

interface Subject {
  id: number;
  name: string;
}

const SubjectList: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    // Load data from localStorage
    const savedSubjects = localStorage.getItem('learning_subjects');
    if (savedSubjects) {
      setSubjects(JSON.parse(savedSubjects));
    }
  }, []);

  const saveToStorage = (data: Subject[]) => {
    localStorage.setItem('learning_subjects', JSON.stringify(data));
  };

  const handleAdd = async () => {
    try {
      const values = await form.validateFields();
      const newSubject: Subject = {
        id: editingId || Date.now(),
        name: values.name,
      };

      let updatedSubjects;
      if (editingId) {
        updatedSubjects = subjects.map(subject =>
          subject.id === editingId ? newSubject : subject
        );
        message.success('Cập nhật môn học thành công!');
      } else {
        updatedSubjects = [...subjects, newSubject];
        message.success('Thêm môn học thành công!');
      }

      setSubjects(updatedSubjects);
      saveToStorage(updatedSubjects);
      setIsModalVisible(false);
      form.resetFields();
      setEditingId(null);
    } catch (error) {
      console.error('Validate Failed:', error);
    }
  };

  const handleEdit = (record: Subject) => {
    setEditingId(record.id);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc muốn xóa môn học này?',
      onOk: () => {
        const updatedSubjects = subjects.filter(subject => subject.id !== id);
        setSubjects(updatedSubjects);
        saveToStorage(updatedSubjects);
        message.success('Xóa môn học thành công!');
      },
    });
  };

  const columns = [
    {
      title: 'Tên môn học',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: Subject) => (
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
    <div className={styles.subjectList}>
      <Button
        type="primary"
        onClick={() => {
          setEditingId(null);
          form.resetFields();
          setIsModalVisible(true);
        }}
        style={{ marginBottom: 16 }}
      >
        Thêm môn học
      </Button>

      <Table
        columns={columns}
        dataSource={subjects}
        rowKey="id"
      />

      <Modal
        title={editingId ? "Sửa môn học" : "Thêm môn học"}
        visible={isModalVisible}
        onOk={handleAdd}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingId(null);
          form.resetFields();
        }}
      >
        <Form form={form}>
          <Form.Item
            name="name"
            label="Tên môn học"
            rules={[{ required: true, message: 'Vui lòng nhập tên môn học!' }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SubjectList;
