import React from 'react';
import styles from '../styles/background.module.css';

const Background = () => {
    return (
        <div className={styles.background}>
            <div className={styles.shape}></div>
            <div className={styles.shape}></div>
        </div>
    );
};

export default Background;