import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SearchableMultiSelect } from '../../components/ui/searchable-multi-select';

describe('SearchableMultiSelect', () => {
  const mockOptions = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry'];
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders with placeholder when no values selected', () => {
    render(
      <SearchableMultiSelect
        options={mockOptions}
        value={[]}
        onChange={mockOnChange}
        placeholder="Select fruits..."
      />
    );

    expect(screen.getByText('Select fruits...')).toBeInTheDocument();
  });

  it('displays selected values as badges', () => {
    render(
      <SearchableMultiSelect
        options={mockOptions}
        value={['Apple', 'Banana']}
        onChange={mockOnChange}
        placeholder="Select fruits..."
      />
    );

    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('Banana')).toBeInTheDocument();
  });

  it('shows "+X more" when more than maxDisplay items selected', () => {
    render(
      <SearchableMultiSelect
        options={mockOptions}
        value={['Apple', 'Banana', 'Cherry', 'Date']}
        onChange={mockOnChange}
        placeholder="Select fruits..."
        maxDisplay={2}
      />
    );

    expect(screen.getByText('+2 more')).toBeInTheDocument();
  });

  it('opens dropdown when clicked', async () => {
    render(
      <SearchableMultiSelect
        options={mockOptions}
        value={[]}
        onChange={mockOnChange}
        placeholder="Select fruits..."
      />
    );

    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search options...')).toBeInTheDocument();
    });

    mockOptions.forEach(option => {
      expect(screen.getByText(option)).toBeInTheDocument();
    });
  });

  it('filters options based on search input', async () => {
    render(
      <SearchableMultiSelect
        options={mockOptions}
        value={[]}
        onChange={mockOnChange}
        placeholder="Select fruits..."
      />
    );

    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);

    const searchInput = screen.getByPlaceholderText('Search options...');
    fireEvent.change(searchInput, { target: { value: 'app' } });

    await waitFor(() => {
      expect(screen.getByText('Apple')).toBeInTheDocument();
      expect(screen.queryByText('Banana')).not.toBeInTheDocument();
    });
  });

  it('calls onChange when option is selected', async () => {
    render(
      <SearchableMultiSelect
        options={mockOptions}
        value={[]}
        onChange={mockOnChange}
        placeholder="Select fruits..."
      />
    );

    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);

    const appleOption = screen.getByText('Apple');
    fireEvent.click(appleOption);

    expect(mockOnChange).toHaveBeenCalledWith(['Apple']);
  });

  it('calls onChange when option is deselected', async () => {
    render(
      <SearchableMultiSelect
        options={mockOptions}
        value={['Apple']}
        onChange={mockOnChange}
        placeholder="Select fruits..."
      />
    );

    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);

    const appleOption = screen.getByText('Apple');
    fireEvent.click(appleOption);

    expect(mockOnChange).toHaveBeenCalledWith([]);
  });

  it('removes item when X button is clicked on badge', () => {
    render(
      <SearchableMultiSelect
        options={mockOptions}
        value={['Apple']}
        onChange={mockOnChange}
        placeholder="Select fruits..."
      />
    );

    const removeButton = screen.getByRole('button', { name: /×/ });
    fireEvent.click(removeButton);

    expect(mockOnChange).toHaveBeenCalledWith([]);
  });

  it('shows empty message when no options match search', async () => {
    render(
      <SearchableMultiSelect
        options={mockOptions}
        value={[]}
        onChange={mockOnChange}
        placeholder="Select fruits..."
        emptyMessage="No fruits found."
      />
    );

    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);

    const searchInput = screen.getByPlaceholderText('Search options...');
    fireEvent.change(searchInput, { target: { value: 'xyz' } });

    await waitFor(() => {
      expect(screen.getByText('No fruits found.')).toBeInTheDocument();
    });
  });
});
