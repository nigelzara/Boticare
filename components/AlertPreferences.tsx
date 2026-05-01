
import React from 'react';
import { AlertLevel } from '../types';

interface ToggleSwitchProps {
  label: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ label, enabled, onChange }) => {
  return (
    <label htmlFor={label} className="flex items-center cursor-pointer justify-between">
      <span className="font-medium text-gray-700 dark:text-gray-300">{label}</span>
      <div className="relative">
        <input id={label} type="checkbox" className="sr-only" checked={enabled} onChange={(e) => onChange(e.target.checked)} />
        <div className={`block w-14 h-8 rounded-full transition ${enabled ? 'bg-blue-600 dark:bg-blue-600' : 'bg-boticare-gray-medium dark:bg-gray-600'}`}></div>
        <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${enabled ? 'translate-x-6' : ''}`}></div>
      </div>
    </label>
  );
};

interface AlertPreferencesProps {
    alertLevels: { [key in AlertLevel]: boolean };
    glucoseThresholds: { low: number; high: number; };
    appointmentReminders: { remind24h: boolean; remind1h: boolean };
    onLevelChange: (level: AlertLevel, enabled: boolean) => void;
    onThresholdChange: (field: 'low' | 'high', value: number) => void;
    onReminderChange: (field: 'remind24h' | 'remind1h', enabled: boolean) => void;
    onSaveChanges: () => void;
    onReset: () => void;
}

const AlertPreferences: React.FC<AlertPreferencesProps> = ({
    alertLevels,
    glucoseThresholds,
    appointmentReminders,
    onLevelChange,
    onThresholdChange,
    onReminderChange,
    onSaveChanges,
    onReset
}) => {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="p-6 border border-boticare-gray-medium rounded-lg dark:border-gray-700">
        <h3 className="text-lg font-bold mb-2">Receive Alerts by Severity</h3>
        <p className="text-sm text-boticare-gray-dark mb-6 dark:text-gray-400">Choose which alert levels you want to be notified about.</p>
        <div className="space-y-4">
          <ToggleSwitch
            label="High Severity Alerts"
            enabled={alertLevels[AlertLevel.High]}
            onChange={(enabled) => onLevelChange(AlertLevel.High, enabled)}
          />
          <ToggleSwitch
            label="Medium Severity Alerts"
            enabled={alertLevels[AlertLevel.Medium]}
            onChange={(enabled) => onLevelChange(AlertLevel.Medium, enabled)}
          />
          <ToggleSwitch
            label="Low Severity Alerts"
            enabled={alertLevels[AlertLevel.Low]}
            onChange={(enabled) => onLevelChange(AlertLevel.Low, enabled)}
          />
        </div>
      </div>

      <div className="p-6 border border-boticare-gray-medium rounded-lg dark:border-gray-700">
        <h3 className="text-lg font-bold mb-2">Appointment Reminders</h3>
        <p className="text-sm text-boticare-gray-dark mb-6 dark:text-gray-400">Configure when you want to be reminded about upcoming appointments.</p>
        <div className="space-y-4">
            <ToggleSwitch
                label="24 Hours Before"
                enabled={appointmentReminders.remind24h}
                onChange={(enabled) => onReminderChange('remind24h', enabled)}
            />
            <ToggleSwitch
                label="1 Hour Before"
                enabled={appointmentReminders.remind1h}
                onChange={(enabled) => onReminderChange('remind1h', enabled)}
            />
        </div>
      </div>

      <div className="p-6 border border-boticare-gray-medium rounded-lg dark:border-gray-700">
        <h3 className="text-lg font-bold mb-2">Custom Metric Thresholds</h3>
        <p className="text-sm text-boticare-gray-dark mb-6 dark:text-gray-400">Set your own thresholds for specific health metrics to receive personalized alerts.</p>
        
        <div className="bg-boticare-gray p-4 rounded-lg dark:bg-gray-700">
          <p className="font-semibold text-gray-800 mb-1 dark:text-gray-200">Blood Glucose</p>
          <p className="text-xs text-boticare-gray-dark mb-4 dark:text-gray-400">Normal range: 70-140 mg/dL</p>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <label htmlFor="low" className="block text-xs font-medium text-gray-600 mb-1 dark:text-gray-400">Low Threshold (mg/dL)</label>
              <input
                type="number"
                id="low"
                name="low"
                value={glucoseThresholds.low}
                onChange={(e) => onThresholdChange('low', Number(e.target.value))}
                className="w-full bg-white rounded-lg border-boticare-gray-medium px-3 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-none dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="high" className="block text-xs font-medium text-gray-600 mb-1 dark:text-gray-400">High Threshold (mg/dL)</label>
              <input
                type="number"
                id="high"
                name="high"
                value={glucoseThresholds.high}
                onChange={(e) => onThresholdChange('high', Number(e.target.value))}
                className="w-full bg-white rounded-lg border-boticare-gray-medium px-3 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-none dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end items-center space-x-4 pt-4">
        <button
          onClick={onReset}
          className="font-semibold text-gray-600 px-6 py-2 rounded-lg hover:bg-boticare-gray transition-colors dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Reset to Default
        </button>
        <button
          onClick={onSaveChanges}
          className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-opacity-90 transition-colors dark:bg-blue-600 dark:hover:bg-blue-700"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default AlertPreferences;
