import React from 'react';
import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const SpinnerContainer = styled.div`
  display: ${props => props.inline ? 'inline-flex' : 'flex'};
  align-items: center;
  justify-content: center;
  ${props => !props.inline && `
    min-height: ${props.height || '200px'};
    width: 100%;
  `}
`;

const Spinner = styled.div`
  width: ${props => props.size || '40px'};
  height: ${props => props.size || '40px'};
  border: 3px solid ${props => props.color || '#f3f3f3'};
  border-top: 3px solid ${props => props.primaryColor || '#2563eb'};
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const LoadingText = styled.span`
  margin-left: 1rem;
  color: ${props => props.textColor || '#6b7280'};
  font-size: ${props => props.textSize || '1rem'};
`;

const LoadingSpinner = ({ 
  size = '40px',
  color = '#f3f3f3',
  primaryColor = '#2563eb',
  text = '',
  textColor = '#6b7280',
  textSize = '1rem',
  height = '200px',
  inline = false
}) => {
  return (
    <SpinnerContainer inline={inline} height={height}>
      <Spinner 
        size={size}
        color={color}
        primaryColor={primaryColor}
      />
      {text && (
        <LoadingText textColor={textColor} textSize={textSize}>
          {text}
        </LoadingText>
      )}
    </SpinnerContainer>
  );
};

export default LoadingSpinner;
