import React from 'react';
import { Card, Tabs } from 'antd';
import SubjectList from '../../components/LearningManagement/SubjectList';
import styles from './index.less';

const { TabPane } = Tabs;

const LearningManagement: React.FC = () => {
  return (
    <div className={styles.container}>
      <Card>
        <Tabs defaultActiveKey="subjects">
          <TabPane tab="Danh mục môn học" key="subjects">
            <SubjectList />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default LearningManagement;