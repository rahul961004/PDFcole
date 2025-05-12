import React from 'react';

interface ModelSelectProps {
  onModelSelect: (model: string) => void;
}

const ModelSelect: React.FC<ModelSelectProps> = ({ onModelSelect }) => {
  const handleModelChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onModelSelect(event.target.value);
  };

  return (
    <div>
      <label htmlFor="ai-model">Select AI Model:</label>
      <select id="ai-model" onChange={handleModelChange}>
        <option value="gpt-4o-mini high">gpt-4o-mini high</option>
      </select>
    </div>
  );
};

export default ModelSelect;