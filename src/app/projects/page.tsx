'use client';

import React, { useState } from 'react';
import {
  Row, Col, Card, Statistic, Modal, Steps, Button, Form, Input, Select, DatePicker, Divider, Space, message
} from 'antd';
import {
  FundOutlined, DollarOutlined, ClockCircleOutlined, CheckCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Step } = Steps;
const { TextArea, Group: InputGroup } = Input;
const { Option } = Select;

export default function ProjectsSO_Mock() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAIModalVisible, setIsAIModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Mock select options
  const statusOptions = [
    { label: 'Active', value: 'active' },
    { label: 'Closed', value: 'closed' },
    { label: 'Paused', value: 'paused' }
  ];
  const countryOptions = [
    { label: 'United States', value: 'US' },
    { label: 'Canada', value: 'CA' }
  ];
  const languageOptions = [
    { label: 'English', value: 'en' },
    { label: 'Spanish', value: 'es' }
  ];
  const genderOptions = [
    { label: 'Male', value: 'M' },
    { label: 'Female', value: 'F' },
    { label: 'Prefer not to say', value: 'N' }
  ];
  const childrenOptions = [
    { label: 'No Children', value: '0' },
    { label: '1 Child', value: '1' },
    { label: '2 Children', value: '2' },
    { label: '3+ Children', value: '3+' }
  ];
  const raceOptions = [
    { label: 'American Indian', value: 'american_indian' },
    { label: 'Asian', value: 'asian' },
    { label: 'Black/African American', value: 'black' },
    { label: 'White', value: 'white' },
    { label: 'Other', value: 'other' }
  ];
  const childrenLegacyOptions = [
    { label: 'Legacy Yes', value: 'yes' },
    { label: 'Legacy No', value: 'no' }
  ];
  const relationshipOptions = [
    { label: 'Single', value: 'single' },
    { label: 'Married', value: 'married' },
    { label: 'Divorced', value: 'divorced' }
  ];
  const employmentOptions = [
    { label: 'Employed', value: 'employed' },
    { label: 'Unemployed', value: 'unemployed' },
    { label: 'Student', value: 'student' },
    { label: 'Retired', value: 'retired' }
  ];
  const educationOptions = [
    { label: 'High School', value: 'high_school' },
    { label: 'Bachelor', value: 'bachelor' },
    { label: 'Master', value: 'master' },
    { label: 'Doctorate', value: 'doctorate' }
  ];
  const raceEthnicityOptions = [
    { label: 'Hispanic', value: 'hispanic' },
    { label: 'Non-Hispanic', value: 'non_hispanic' }
  ];
  const hispanicOriginOptions = [
    { label: 'Mexican', value: 'mexican' },
    { label: 'Puerto Rican', value: 'puerto_rican' },
    { label: 'Other', value: 'other' }
  ];
  const deviceOptions = [
    { label: 'Desktop', value: 'desktop' },
    { label: 'Mobile', value: 'mobile' },
    { label: 'Tablet', value: 'tablet' }
  ];
  const regionOptions = [
    { label: 'Northeast', value: 'northeast' },
    { label: 'Midwest', value: 'midwest' },
    { label: 'South', value: 'south' },
    { label: 'West', value: 'west' }
  ];
  const divisionOptions = [
    { label: 'Division A', value: 'div_a' },
    { label: 'Division B', value: 'div_b' }
  ];
  const stateOptions = [
    { label: 'California', value: 'CA' },
    { label: 'New York', value: 'NY' }
  ];
  const msaOptions = [
    { label: 'Los Angeles', value: 'la' },
    { label: 'New York City', value: 'nyc' }
  ];
  const csaOptions = [
    { label: 'CSA 1', value: 'csa1' },
    { label: 'CSA 2', value: 'csa2' }
  ];
  const countyOptions = [
    { label: 'Los Angeles County', value: 'la_county' },
    { label: 'Kings County', value: 'kings_county' }
  ];
  const dmaOptions = [
    { label: 'DMA 1', value: 'dma1' },
    { label: 'DMA 2', value: 'dma2' }
  ];

  // Mock state
  const totalCompletes = 120;
  const averageCPI = '$1.25';
  const fieldTime = 7;

  const [quotas, setQuotas] = useState([
    { name: '', code: '', cpi: '', target: '', redirect_url: '', gender: [], ageFrom: 18, ageTo: 65, incomeFrom: 0, incomeTo: 999999 }
  ]);

  const next = () => setCurrentStep(s => s + 1);
  const prev = () => setCurrentStep(s => s - 1);
  const addQuota = () => setQuotas([...quotas, { name: '', code: '', cpi: '', target: '', redirect_url: '', gender: [], ageFrom:18, ageTo:65, incomeFrom:0, incomeTo:999999 }]);
  const removeQuota = i => setQuotas(quotas.filter((_,idx) => idx !== i));
  const updateQuota = (i, field, val) => setQuotas(quotas.map((q,idx)=>(idx===i?{...q,[field]:val}:q)));

  return (
    <div className="p-4 bg-white">
      {/* KPI Row */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card hoverable>
            <Statistic title="Feasibility" value={totalCompletes} prefix={<FundOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card hoverable>
            <Statistic title="CPI" value={averageCPI} prefix={<DollarOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Field Time" value={fieldTime} suffix="days" prefix={<ClockCircleOutlined />} />
          </Card>
        </Col>
        <Col span={6} className="flex justify-end items-center">
          <Button type="primary" size="large" icon={<CheckCircleOutlined />} onClick={() => setIsAIModalVisible(true)}>
            Generate with AI
          </Button>
        </Col>
      </Row>

      {/* Steps & Form */}
      <Card className="bg-white p-6 rounded shadow mb-6">
        <h3 className="text-lg font-semibold mb-4">{currentStep===0?'Create Project':'Edit Project'}</h3>
        <Steps current={currentStep} style={{ marginBottom: 24 }}>
          <Step title="Project Info" />
          <Step title="Quotas" />
        </Steps>

        <Form form={form} layout="vertical">
          {currentStep===0 && (
            <>
              <Row gutter={16}>
                <Col span={6}>
                  <Form.Item label="* Name" name="name">
                    <Input placeholder="Project Name" />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="* Code" name="code">
                    <Input placeholder="Project Code" />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="End Date" name="end_date">
                    <DatePicker style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="CPI ($)" name="cpi_buyer">
                    <Input type="number" placeholder="0.00" />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="* Status" name="status">
                    <Select options={statusOptions} placeholder="Select status" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="* Description" name="description">
                    <TextArea rows={2} placeholder="Project Description" />
                  </Form.Item>
                </Col>
              </Row>

              <Divider orientation="left">Targeting</Divider>
              <Row gutter={16}>
                <Col span={6}>
                  <Form.Item label="Country" name="country">
                    <Select options={countryOptions} placeholder="Select country" />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="Language" name="language">
                    <Select options={languageOptions} placeholder="Select language" />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="Completes" name="completes">
                    <Input type="number" placeholder="0" />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="LOI (mins)" name="length">
                    <Input type="number" placeholder="0" />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="Incidence (%)" name="incidence">
                    <Input type="number" placeholder="0%" />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="Field Time (days)" name="field_time">
                    <Input type="number" placeholder="0" />
                  </Form.Item>
                </Col>
              </Row>
            </>
          )}

          {currentStep===1 && quotas.map((q, idx) => (
            <div key={idx} className="p-4 border rounded mb-4">
              <Row gutter={16}>
                <Col span={6}>
                  <Form.Item label="* Name">
                    <Input value={q.name} onChange={e=>updateQuota(idx,'name',e.target.value)} />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="Code">
                    <Input value={q.code} onChange={e=>updateQuota(idx,'code',e.target.value)} />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="* CPI ($)">
                    <Input type="number" value={q.cpi} onChange={e=>updateQuota(idx,'cpi',e.target.value)} />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="* Target">
                    <Input type="number" value={q.target} onChange={e=>updateQuota(idx,'target',e.target.value)} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="Redirect URL">
                    <TextArea rows={1} value={q.redirect_url} onChange={e=>updateQuota(idx,'redirect_url',e.target.value)} />
                  </Form.Item>
                </Col>
              </Row>

              <Divider orientation="left">Qualifications</Divider>
<Row gutter={16}>
  <Col span={6}>
    <Form.Item label="Gender">
      <Select mode="multiple" options={genderOptions} value={q.gender} onChange={v=>updateQuota(idx,'gender',v)} />
    </Form.Item>
  </Col>
  <Col span={6}>
    <Form.Item label="Age Range">
      <InputGroup compact>
        <Input style={{ width:'45%',textAlign:'center'}} type="number" value={q.ageFrom} onChange={e=>updateQuota(idx,'ageFrom',+e.target.value)} />
        <Input style={{ width:'10%',textAlign:'center',pointerEvents:'none',backgroundColor:'#fff'}} placeholder="to" disabled />
        <Input style={{ width:'45%',textAlign:'center'}} type="number" value={q.ageTo} onChange={e=>updateQuota(idx,'ageTo',+e.target.value)} />
      </InputGroup>
    </Form.Item>
  </Col>
  <Col span={6}>
    <Form.Item label="Income Range">
      <InputGroup compact>
        <Input style={{ width:'45%',textAlign:'center'}} type="number" value={q.incomeFrom} onChange={e=>updateQuota(idx,'incomeFrom',+e.target.value)} />
        <Input style={{ width:'10%',textAlign:'center',pointerEvents:'none',backgroundColor:'#fff'}} placeholder="to" disabled />
        <Input style={{ width:'45%',textAlign:'center'}} type="number" value={q.incomeTo} onChange={e=>updateQuota(idx,'incomeTo',+e.target.value)} />
      </InputGroup>
    </Form.Item>
  </Col>
  <Col span={6}>
    <Form.Item label="Children">
      <Select options={childrenOptions} placeholder="Select children" />
    </Form.Item>
  </Col>
  <Col span={6}>
    <Form.Item label="Race">
      <Select options={raceOptions} placeholder="Select race" />
    </Form.Item>
  </Col>
  <Col span={6}>
    <Form.Item label="Children Legacy">
      <Select options={childrenLegacyOptions} placeholder="Select children legacy" />
    </Form.Item>
  </Col>
  <Col span={6}>
    <Form.Item label="Relationship">
      <Select options={relationshipOptions} placeholder="Select relationship" />
    </Form.Item>
  </Col>
  <Col span={6}>
    <Form.Item label="Employment">
      <Select options={employmentOptions} placeholder="Select employment" />
    </Form.Item>
  </Col>
  <Col span={6}>
    <Form.Item label="Education">
      <Select options={educationOptions} placeholder="Select education" />
    </Form.Item>
  </Col>
  <Col span={6}>
    <Form.Item label="Race Ethnicity">
      <Select options={raceEthnicityOptions} placeholder="Select ethnicity" />
    </Form.Item>
  </Col>
  <Col span={6}>
    <Form.Item label="Hispanic Origin">
      <Select options={hispanicOriginOptions} placeholder="Select origin" />
    </Form.Item>
  </Col>
  <Col span={6}>
    <Form.Item label="Device">
      <Select options={deviceOptions} placeholder="Select device" />
    </Form.Item>
  </Col>
  <Col span={6}>
    <Form.Item label="Region">
      <Select options={regionOptions} placeholder="Select region" />
    </Form.Item>
  </Col>
  <Col span={6}>
    <Form.Item label="Division">
      <Select options={divisionOptions} placeholder="Select division" />
    </Form.Item>
  </Col>
  <Col span={6}>
    <Form.Item label="State">
      <Select options={stateOptions} placeholder="Select state" />
    </Form.Item>
  </Col>
  <Col span={6}>
    <Form.Item label="MSA">
      <Select options={msaOptions} placeholder="Select MSA" />
    </Form.Item>
  </Col>
  <Col span={6}>
    <Form.Item label="CSA">
      <Select options={csaOptions} placeholder="Select CSA" />
    </Form.Item>
  </Col>
  <Col span={6}>
    <Form.Item label="County">
      <Select options={countyOptions} placeholder="Select county" />
    </Form.Item>
  </Col>
  <Col span={6}>
    <Form.Item label="DMA">
      <Select options={dmaOptions} placeholder="Select DMA" />
    </Form.Item>
  </Col>
</Row>

<Space className="flex justify-end" style={{ marginTop:16 }}>
  <Button danger onClick={()=>removeQuota(idx)}>Remove</Button>
  {idx===quotas.length-1 && <Button onClick={addQuota}>Add</Button>}
</Space>
            </div>
          ))}

          <Space className="flex justify-end float-right" style={{ marginTop:16 }}>
            {currentStep>0 && <Button onClick={prev}>Previous</Button>}
            {currentStep<1 && <Button type="primary" onClick={next}>Next</Button>}
            {currentStep===1 && <Button type="primary" onClick={() => message.success('Saved')}>Save</Button>}
          </Space>
        </Form>
      </Card>

      <Modal title="Generate with AI" open={isAIModalVisible} onCancel={()=>setIsAIModalVisible(false)} onOk={()=>setIsAIModalVisible(false)}>
        <TextArea rows={6} placeholder="Enter project details..." />
      </Modal>
    </div>
  );
}
