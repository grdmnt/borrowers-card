import React, { useState, useEffect, useRef } from 'react';
import styles from '@/styles/components/FormControls.module.css';

interface AutocompleteOption {
  id: string;
  name: string;
  email?: string;
}

interface AutocompleteProps {
  label?: string;
  value: string;
  onChange: (value: string, option?: AutocompleteOption) => void;
  options: AutocompleteOption[];
  placeholder?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  loading?: boolean;
}

const Autocomplete: React.FC<AutocompleteProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder,
  error,
  helperText,
  required = false,
  disabled = false,
  loading = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState<AutocompleteOption[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Filter options based on input value
  useEffect(() => {
    if (!value.trim()) {
      setFilteredOptions(options);
    } else {
      const filtered = options.filter(option =>
        option.name.toLowerCase().includes(value.toLowerCase()) ||
        (option.email && option.email.toLowerCase().includes(value.toLowerCase()))
      );
      setFilteredOptions(filtered);
    }
    setHighlightedIndex(-1);
  }, [value, options]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setIsOpen(true);
  };

  // Handle option selection
  const handleOptionSelect = (option: AutocompleteOption) => {
    onChange(option.name, option);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
        return;
      }
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          handleOptionSelect(filteredOptions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Handle input focus
  const handleFocus = () => {
    setIsOpen(true);
  };

  // Handle input blur
  const handleBlur = (e: React.FocusEvent) => {
    // Delay closing to allow option clicks
    setTimeout(() => {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }, 150);
  };

  // Scroll highlighted option into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const highlightedElement = listRef.current.children[highlightedIndex] as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        });
      }
    }
  }, [highlightedIndex]);

  const inputClasses = [
    styles.input,
    error && styles.error,
    disabled && styles.disabled
  ].filter(Boolean).join(' ');

  const containerClasses = [
    styles.inputGroup,
    isOpen && styles.focused
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      {label && (
        <label className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      
      <div className={styles.autocompleteContainer}>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled || loading}
          className={inputClasses}
          autoComplete="off"
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-autocomplete="list"
        />
        
        {loading && (
          <div className={styles.loadingIndicator}>
            <div className={styles.spinner}></div>
          </div>
        )}

        {isOpen && filteredOptions.length > 0 && (
          <ul
            ref={listRef}
            className={styles.optionsList}
            role="listbox"
          >
            {filteredOptions.map((option, index) => (
              <li
                key={option.id}
                className={`${styles.option} ${
                  index === highlightedIndex ? styles.highlighted : ''
                }`}
                onClick={() => handleOptionSelect(option)}
                role="option"
                aria-selected={index === highlightedIndex}
              >
                <div className={styles.optionContent}>
                  <div className={styles.optionName}>{option.name}</div>
                  {option.email && (
                    <div className={styles.optionEmail}>{option.email}</div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        {isOpen && filteredOptions.length === 0 && value.trim() && (
          <div className={styles.noOptions}>
            No group members found matching "{value}"
          </div>
        )}
      </div>

      {error && (
        <div className={styles.errorText}>{error}</div>
      )}
      
      {helperText && !error && (
        <div className={styles.helperText}>{helperText}</div>
      )}
    </div>
  );
};

export default Autocomplete;
