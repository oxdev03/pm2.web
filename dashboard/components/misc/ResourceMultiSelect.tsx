import { useEffect, useState } from 'react';
import { Box, CheckIcon, CloseButton, Combobox, Flex, Group, Input, MultiSelectProps, Pill, PillsInput, useCombobox } from '@mantine/core';
import { IconCircleFilled, IconLock } from '@tabler/icons-react';
import { IProcess } from '@/types/server';

interface ResourceMultiSelectProps extends MultiSelectProps {
  data: IResource[];
}

interface IResource {
  status: IProcess['status'];
  disabled: boolean;
  label: string;
  value: string;
}

export function ResourceMultiSelect(props: ResourceMultiSelectProps) {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
    onDropdownOpen: () => combobox.updateSelectedOptionIndex('active'),
  });

  const [value, setValue] = useState<string[]>([]);

  const handleValueSelect = (val: string) => setValue((current) => (current.includes(val) ? current.filter((v) => v !== val) : [...current, val]));

  const handleValueRemove = (val: string) => setValue((current) => current.filter((v) => v !== val));

  const values = props.data
    .filter((opt) => value.includes(opt.value))
    .map((opt) => (
      <Pill key={opt.value} withRemoveButton onRemove={() => handleValueRemove(opt.value)}>
        {opt.label}
      </Pill>
    ));

  const options = props.data
    .filter((opt) => !value.includes(opt.value))
    .map((opt) => {
      return (
        <Combobox.Option value={opt.value} key={opt.value} active={value.includes(opt.value)}>
          <Flex align="center">
            <Box mr={10}>
              {opt.disabled ? (
                <IconLock size={14} />
              ) : (
                <IconCircleFilled
                  size={10}
                  style={{
                    color: opt.status === 'online' ? '#12B886' : opt.status === 'stopped' ? '#FCC419' : '#FA5252',
                  }}
                />
              )}
            </Box>
            <div>{opt.label}</div>
          </Flex>
        </Combobox.Option>
      );
    });

  useEffect(() => {
    props.onChange?.(value);
  }, [value]);

  return (
    <Combobox store={combobox} onOptionSubmit={handleValueSelect} withinPortal={false}>
      <Combobox.DropdownTarget>
        <PillsInput pointer onClick={() => combobox.toggleDropdown()}>
          <Pill.Group>
            {values.length > 0 ? values : <Input.Placeholder>{props.placeholder}</Input.Placeholder>}

            <Combobox.EventsTarget>
              <PillsInput.Field
                type="hidden"
                onBlur={() => combobox.closeDropdown()}
                onKeyDown={(event) => {
                  if (event.key === 'Backspace') {
                    event.preventDefault();
                    handleValueRemove(value[value.length - 1]);
                  }
                }}
              />
            </Combobox.EventsTarget>
          </Pill.Group>
        </PillsInput>
      </Combobox.DropdownTarget>

      <Combobox.Dropdown>
        <Combobox.Options>{options}</Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}
