import React, { useEffect, useState } from 'react';
import Select, { SelectOption } from './Select';

interface ModelRecord {
  id: string;
  value: string;
  label: string;
  promptCount: number;
}

interface ModelSelectProps {
  value: string | null;
  onChange: (model: string | null) => void;
  className?: string;
}

const ModelSelect: React.FC<ModelSelectProps> = ({ value, onChange, className = '' }) => {
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchModels = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/models');
        if (res.ok) {
          const data = await res.json();
          if (data?.models) {
            setOptions(
              data.models.map((m: ModelRecord) => ({ value: m.value, label: m.label }))
            );
          }
        }
      } catch (err) {
        console.error('Error fetching models', err);
      } finally {
        setLoading(false);
      }
    };
    fetchModels();
  }, []);

  if (loading) {
    return (
      <div className={`flex w-full items-center p-3 border border-border rounded-xl bg-background/80 backdrop-blur-md text-text ${className}`}>
        <div className="animate-spin h-5 w-5 border-2 border-primary rounded-full border-t-transparent mr-2"></div>
        <span>Loading models...</span>
      </div>
    );
  }

  return (
    <Select
      value={value}
      onChange={onChange}
      options={options}
      placeholder="Select an AI model"
      className={className}
      clearText="No model"
      allowClear={true}
    />
  );
};

export default ModelSelect;
