import React, { useEffect, useState, useRef } from 'react';
import Markdown from 'react-markdown'
import { useNavigate } from 'react-router-dom';
import { useContextStore } from '../lib/ContextStore';
import Header from './Header';
import config from '../config.json';
const BASE_URL = config.BACKEND_URL;

const b64toBlob = (b64Data, contentType = '', sliceSize = 512) => {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, { type: contentType });
    return blob;
};

const ResultsPage = () => {
    const navigate = useNavigate();
    const insPollingRef = useRef(null);
    const amzPollingRef = useRef(null);

    const [insTaskStatus, setInsTaskStatus] = useState('');
    const [insTaskResult, setInsTaskResult] = useState('NULL');
    const [amznTaskStatus, setAmznTaskStatus] = useState('');
    const [amznTaskResult, setAmznTaskResult] = useState('NULL');

    const { ins_task_id, setins_task_id } = useContextStore();
    const { amzn_task_id, setamzn_task_id } = useContextStore();

    const pollEndpoint = async (task_id) => {
        if (!task_id) {
            return;
        }
        try {
            const response = await fetch(`${BASE_URL}/task/${task_id}`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching task data:', error);
        }
    };

    useEffect(() => {
        const poll = () => {
            insPollingRef.current = setInterval(async () => {
                const data = await pollEndpoint(ins_task_id);
                if (data) {
                    setInsTaskStatus(data.state);
                    setInsTaskResult(data.result || 'NULL');
                    if (data.state !== 'PENDING') {
                        clearInterval(insPollingRef.current);

                        if (data.state === 'SUCCESS') {
                            setInsTaskResult(data.result)
                        }
                    }
                } else {
                    setInsTaskResult('NULL');
                    clearInterval(insPollingRef.current);
                }
            }, 2000);
        };

        if (ins_task_id) poll();
        return () => clearInterval(insPollingRef.current);
    }, [ins_task_id]);

    useEffect(() => {
        const poll = () => {
            amzPollingRef.current = setInterval(async () => {
                const data = await pollEndpoint(amzn_task_id);
                if (data) {
                    setAmznTaskStatus(data.state);
                    setAmznTaskResult(data.result || 'NULL');
                    if (data.state !== 'PENDING') {
                        clearInterval(amzPollingRef.current);
                    }
                } else {
                    setAmznTaskResult('NULL');
                    clearInterval(amzPollingRef.current);
                }
            }, 2000);
        };

        if (amzn_task_id) poll();
        return () => clearInterval(amzPollingRef.current);
    }, [amzn_task_id]);

    const handleDownload = () => {
        // Ensure that the task is successful and result is not 'NULL'
        if (amznTaskStatus === 'SUCCESS' && amznTaskResult !== 'NULL') {
            const blob = b64toBlob(amznTaskResult, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            const blobUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = 'inventory.xlsx'; // Set the file name for download
            document.body.appendChild(a);
            a.click();
            a.remove();
        }
    };

    return (
        <div>
            <Header />
            <div className='results-main-cont'>
                <div className="results-top">
                    <h2 className="your-results-heading">Your Results:</h2>
                    <p className="results-description">
                        Below are the results of your tasks. Please check the detailed information from both the Insurance and Amazon results.
                    </p>
                </div>
                <div className="results-container">
                {/* Render Insurance Column */}
                {(insTaskStatus === "SUCCESS") && (
                        <div className="results-column-insurance">
                            <h1>Insurance Coverage Summary</h1>
                            <Markdown components={{h1: 'h2', h2: 'h3'}}>{insTaskResult}</Markdown>
                        </div>
                    )}
                    {(insTaskStatus === 'PENDING') && (
                        <div className='results-column insurance'>
                            <p>Trust me, i'm spinning</p>
                        </div>
                    )}

                {/* Render Amazon Column */}
                {(amznTaskStatus === "SUCCESS" && amznTaskResult !== 'NULL') && (
                        <div className="results-columnamazon">
                            <h2 id='amazon-result'>Item Inventory</h2>
                            <button className='button' onClick={handleDownload}>Download</button>
                            <pre>{'Download the itemized inventory of your ...'}</pre>
                        </div>
                    )}
                    {(amznTaskStatus === 'PENDING') && (
                        <div className='results-column amazon'>
                            <p>Trust me again, i'm spinning</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResultsPage;
