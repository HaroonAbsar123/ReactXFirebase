import React from 'react';
import Modal from '@mui/material/Modal';
import classes from './CustomModal.module.css';

// TO INSTALL MATERIAL UI TYPE FOLLOWING IN TERMINAL
// npm install @mui/material @emotion/react @emotion/styled
// npm install @mui/material @mui/styled-engine-sc styled-components

export default function CustomModal({ open, onClose, children }) {
  return (
    <Modal
      className={classes.modal}
      open={open}
      onClose={onClose}
    >
      <div className={classes.container}>
        <div className={classes.innerContainer}>
        <div className={classes.childContainer}>
          {children}
          </div>
        </div>
      </div>
    </Modal>
  );
};


