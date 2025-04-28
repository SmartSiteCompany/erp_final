import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const SelectGroup = ({
  name,
  label,
  value,
  onChange,
  options,
  groupBy,
  required = false,
  placeholder = "Seleccionar...",
  className = "form-select",
  searchEnabled = true
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  const filteredAndGroupedOptions = () => {
    const filtered = searchTerm 
      ? options.filter(option => 
          option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (groupBy && option[groupBy]?.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      : options;

    if (groupBy) {
      return filtered.reduce((groups, option) => {
        const groupValue = option[groupBy] || 'Otros';
        if (!groups[groupValue]) groups[groupValue] = [];
        groups[groupValue].push(option);
        return groups;
      }, {});
    }

    return filtered;
  };

  const handleSelectChange = (selectedValue) => {
    onChange({ target: { name, value: selectedValue } });
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClickOutside = (event) => {
    if (selectRef.current && !selectRef.current.contains(event.target)) {
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const optionsData = filteredAndGroupedOptions();
  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="mb-3 position-relative" ref={selectRef}>
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="text-danger"> *</span>}
        </label>
      )}

      <div 
        className={`${className} custom-select`} 
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedOption ? selectedOption.label : placeholder}
      </div>

      {isOpen && (
    <div className="card form-control select2 p-1" style={{
        position: 'absolute', backgroundColor: 'white', boxShadow: '0 2px 6px rgba(0,0,0,0.15)', zIndex: 10, width: '100%'
      }}
      >
    {searchEnabled && (
      <div className="select-search">
        <input
          type="text"
          placeholder="Buscar..."
          className="form-control"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          autoFocus
        />
      </div>
    )}

    <div className="select-options select2" style={{ maxHeight: '200px', overflowY: 'auto' }}>
      {groupBy && typeof optionsData === 'object' ? (
        Object.entries(optionsData).map(([groupName, groupItems]) => (
          <React.Fragment key={groupName}>
            <div className="option-group fw-bold">{groupName}</div>
            {groupItems.map(option => (
              <div
                key={option.value}
                className={`option-item ${value === option.value ? 'selected bg-primary text-white' : ''}`}
                onClick={() => handleSelectChange(option.value)}
              >
                {option.label}
              </div>
            ))}
          </React.Fragment>
        ))
      ) : (
        (Array.isArray(optionsData) ? optionsData : []).map(option => (
          <div
            key={option.value}
            className={`option-item ${value === option.value ? 'selected bg-primary text-white' : ''}`}
            onClick={() => handleSelectChange(option.value)}
          >
            {option.label}
          </div>
        ))
      )}

      {(!optionsData ||
        (groupBy && Object.keys(optionsData).length === 0) ||
        (!groupBy && optionsData.length === 0)) && (
        <div className="option-item no-results">No se encontraron resultados</div>
      )}
    </div>
  </div>
)}

    </div>
  );
};

SelectGroup.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  value: PropTypes.any,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.any.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  groupBy: PropTypes.string,
  required: PropTypes.bool,
  placeholder: PropTypes.string,
  className: PropTypes.string,
  searchEnabled: PropTypes.bool,
};

export default SelectGroup;
