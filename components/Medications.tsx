

import React, { useState } from 'react';
import { MEDICATIONS_DATA } from '../constants';
import MedicationCard from './MedicationCard';
import Toast from './Toast';

const Medications: React.FC = () => {
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    return (
        <div className="space-y-6">
            {toastMessage && <Toast message={toastMessage} type="success" onClose={() => setToastMessage(null)} />}
            <div>
                <h2 className="text-2xl font-bold">Medications</h2>
                <p className="text-boticare-gray-dark dark:text-gray-400">Manage your medications and view your schedule.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {MEDICATIONS_DATA.map(med => (
                    <MedicationCard 
                        key={med.id} 
                        medication={med}
                        setToastMessage={setToastMessage}
                    />
                ))}
            </div>
        </div>
    );
};

export default Medications;