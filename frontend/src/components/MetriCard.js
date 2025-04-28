// src/components/MetricCard.js
import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { Clock, PlayCircle, CheckCircle } from 'react-bootstrap-icons';

const MetricCard = ({ title, value, icon, color, percentage, percentageColor }) => {
  const IconComponent = icon;
  
  return (
    <Col md={6} lg={4} xl={3} className="mb-4">
      <Card>
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className={`text-${color}`}>
                <IconComponent className="me-2" />
                {value}
              </h5>
              <h6 className="text-muted">{title}</h6>
            </div>
            {percentage && (
              <div className={`text-${percentageColor} fw-bold`}>
                {percentage}%
              </div>
            )}
          </div>
        </Card.Body>
      </Card>
    </Col>
  );
};

export default MetricCard;