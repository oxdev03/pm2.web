/* Source: https://github.com/mantinedev/mantine/blob/master/packages/%40mantine/core/src/components/MultiSelect/MultiSelect.tsx */

import React, { useEffect, useRef } from "react";

import {
  __BaseInputProps,
  __CloseButtonProps,
  __InputStylesNames,
  Combobox,
  extractStyleProps,
  factory,
  InputBase,
  MultiSelectFactory,
  MultiSelectProps,
  MultiSelectStylesNames,
  Pill,
  PillsInput,
  ScrollArea,
  useCombobox,
  useProps,
  useResolvedStylesApi,
  useStyles,
} from "@mantine/core";
import { useId, useUncontrolled } from "@mantine/hooks";

export interface IItem {
  label: string;
  value: string;
  disabled?: boolean;
}

interface CustomMultiSelectProps extends MultiSelectProps {
  data: IItem[];
  pillComponent?: (item: IItem & any) => JSX.Element;
  itemComponent?: (item: IItem & any) => JSX.Element;
}

const defaultProps: Partial<CustomMultiSelectProps> = {
  maxValues: Infinity,
  withCheckIcon: true,
  checkIconPosition: "left",
  hiddenInputValuesDivider: ",",
};

type CustomMultiSelectFactory = {
  props: CustomMultiSelectProps;
  ref: HTMLInputElement;
  stylesNames: MultiSelectStylesNames;
};

export const CustomMultiSelect = factory<CustomMultiSelectFactory>((_props, ref) => {
  const props = useProps("MultiSelect", defaultProps, _props);
  const {
    classNames,
    className,
    style,
    styles,
    unstyled,
    vars,
    size,
    value,
    defaultValue,
    onChange,
    onKeyDown,
    variant,
    data,
    dropdownOpened,
    defaultDropdownOpened,
    onDropdownOpen,
    onDropdownClose,
    selectFirstOptionOnChange,
    onOptionSubmit,
    comboboxProps,
    filter,
    limit,
    withScrollArea,
    maxDropdownHeight,
    searchValue,
    defaultSearchValue,
    onSearchChange,
    readOnly,
    disabled,
    onFocus,
    onBlur,
    onPaste,
    radius,
    rightSection,
    rightSectionWidth,
    rightSectionPointerEvents,
    rightSectionProps,
    leftSection,
    leftSectionWidth,
    leftSectionPointerEvents,
    leftSectionProps,
    inputContainer,
    inputWrapperOrder,
    withAsterisk,
    labelProps,
    descriptionProps,
    errorProps,
    wrapperProps,
    description,
    label,
    error,
    maxValues,
    searchable,
    nothingFoundMessage,
    withCheckIcon,
    checkIconPosition,
    hidePickedOptions,
    withErrorStyles,
    name,
    form,
    id,
    clearable,
    clearButtonProps,
    hiddenInputProps,
    placeholder,
    hiddenInputValuesDivider,
    required,
    itemComponent,
    pillComponent,
    //mod,
    ...others
  } = props;

  const _id = useId(id);
  const combobox = useCombobox({
    opened: dropdownOpened,
    defaultOpened: defaultDropdownOpened,
    onDropdownOpen,
    onDropdownClose: () => {
      onDropdownClose?.();
      combobox.resetSelectedOption();
    },
  });

  const {
    styleProps,
    rest: { type, ...rest },
  } = extractStyleProps(others);

  const [_value, setValue] = useUncontrolled({
    value,
    defaultValue,
    finalValue: [],
    onChange,
  });

  const [_searchValue, setSearchValue] = useUncontrolled({
    value: searchValue,
    defaultValue: defaultSearchValue,
    finalValue: "",
    onChange: onSearchChange,
  });

  const getStyles = useStyles<MultiSelectFactory>({
    name: "MultiSelect",
    classes: {} as any,
    props,
    classNames,
    styles,
    unstyled,
  });

  const { resolvedClassNames, resolvedStyles } = useResolvedStylesApi<MultiSelectFactory>({
    props,
    styles,
    classNames,
  });

  const handleInputKeydown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);

    if (event.key === " " && !searchable) {
      event.preventDefault();
      combobox.toggleDropdown();
    }

    if (event.key === "Backspace" && _searchValue.length === 0 && _value.length > 0) {
      setValue(_value.slice(0, _value.length - 1));
    }
  };

  const values = data
    .filter((opt) => _value.includes(opt.value))
    .map((item, index) => (
      <Pill
        key={`${item}-${index}`}
        withRemoveButton={!readOnly && !item?.disabled}
        onRemove={() => setValue(_value.filter((i) => item.value !== i))}
        unstyled={unstyled}
        {...getStyles("pill")}
      >
        {pillComponent ? pillComponent(item) : item.label}
      </Pill>
    ));

  const filteredData = data.filter((opt) => opt.label.toLowerCase().includes(_searchValue.trim().toLowerCase()));

  const options = filteredData
    .filter((opt) => !_value.includes(opt?.value))
    .map((opt) => {
      return (
        <Combobox.Option value={opt.value} key={opt.value} active={_value.includes(opt.value)}>
          {itemComponent ? itemComponent(opt) : opt.label}
        </Combobox.Option>
      );
    });

  useEffect(() => {
    if (selectFirstOptionOnChange) {
      combobox.selectFirstOption();
    }
  }, [selectFirstOptionOnChange, _value]);

  const clearButton = clearable && _value.length > 0 && !disabled && !readOnly && (
    <Combobox.ClearButton
      size={size as string}
      {...clearButtonProps}
      onClear={() => {
        setValue([]);
        setSearchValue("");
      }}
    />
  );

  return (
    <>
      <Combobox
        store={combobox}
        classNames={resolvedClassNames}
        styles={resolvedStyles}
        unstyled={unstyled}
        size={size}
        readOnly={readOnly}
        __staticSelector="MultiSelect"
        onOptionSubmit={(val) => {
          onOptionSubmit?.(val);
          setSearchValue("");
          combobox.updateSelectedOptionIndex("selected");

          if (_value.includes(val)) {
            setValue(_value.filter((v) => v !== val));
          } else if (_value.length < maxValues!) {
            setValue([..._value, val]);
          }
        }}
        {...comboboxProps}
      >
        <Combobox.DropdownTarget>
          <PillsInput
            {...styleProps}
            __staticSelector="MultiSelect"
            classNames={resolvedClassNames}
            styles={resolvedStyles}
            unstyled={unstyled}
            size={size}
            className={className}
            style={style}
            variant={variant}
            disabled={disabled}
            radius={radius}
            rightSection={
              rightSection || clearButton || <Combobox.Chevron size={size} error={error} unstyled={unstyled} />
            }
            rightSectionPointerEvents={rightSectionPointerEvents || (clearButton ? "all" : "none")}
            rightSectionWidth={rightSectionWidth}
            rightSectionProps={rightSectionProps}
            leftSection={leftSection}
            leftSectionWidth={leftSectionWidth}
            leftSectionPointerEvents={leftSectionPointerEvents}
            leftSectionProps={leftSectionProps}
            inputContainer={inputContainer}
            inputWrapperOrder={inputWrapperOrder}
            withAsterisk={withAsterisk}
            labelProps={labelProps}
            descriptionProps={descriptionProps}
            errorProps={errorProps}
            wrapperProps={wrapperProps}
            description={description}
            label={label}
            error={error}
            multiline
            withErrorStyles={withErrorStyles}
            __stylesApiProps={{
              ...props,
              rightSectionPointerEvents: rightSectionPointerEvents || (clearButton ? "all" : "none"),
              multiline: true,
            }}
            pointer={!searchable}
            onClick={() => (searchable ? combobox.openDropdown() : combobox.toggleDropdown())}
            data-expanded={combobox.dropdownOpened || undefined}
            id={_id}
            required={required}
            // mod={mod}
          >
            <Pill.Group disabled={disabled} unstyled={unstyled} {...getStyles("pillsList")}>
              {values}
              <Combobox.EventsTarget>
                <PillsInput.Field
                  {...rest}
                  hidden={!!_value.length}
                  ref={ref}
                  id={_id}
                  placeholder={placeholder}
                  type={!searchable && !placeholder ? "hidden" : "visible"}
                  {...getStyles("inputField")}
                  unstyled={unstyled}
                  onFocus={(event) => {
                    onFocus?.(event);
                    searchable && combobox.openDropdown();
                  }}
                  onBlur={(event) => {
                    onBlur?.(event);
                    combobox.closeDropdown();
                    setSearchValue("");
                  }}
                  onKeyDown={handleInputKeydown}
                  value={_searchValue}
                  onChange={(event) => {
                    setSearchValue(event.currentTarget.value);
                    searchable && combobox.openDropdown();
                    selectFirstOptionOnChange && combobox.selectFirstOption();
                  }}
                  disabled={disabled}
                  readOnly={readOnly || !searchable}
                  pointer={!searchable}
                />
              </Combobox.EventsTarget>
            </Pill.Group>
          </PillsInput>
        </Combobox.DropdownTarget>

        <Combobox.Dropdown
          hidden={
            (!searchable || !nothingFoundMessage || (hidePickedOptions && _searchValue.trim().length === 0)) &&
            !options.length
          }
        >
          {withScrollArea ? (
            <ScrollArea.Autosize
              mah={maxDropdownHeight ?? 220}
              type="scroll"
              scrollbarSize="var(--_combobox-padding)"
              offsetScrollbars="y"
            >
              {options}
            </ScrollArea.Autosize>
          ) : (
            options
          )}
          {!options.length && nothingFoundMessage && <Combobox.Empty>{nothingFoundMessage}</Combobox.Empty>}
        </Combobox.Dropdown>
      </Combobox>
      <input
        type="hidden"
        name={name}
        value={_value.join(hiddenInputValuesDivider)}
        form={form}
        disabled={disabled}
        {...hiddenInputProps}
      />
    </>
  );
});

CustomMultiSelect.classes = { ...InputBase.classes, ...Combobox.classes };
