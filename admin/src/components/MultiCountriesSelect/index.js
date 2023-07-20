import React, { useMemo, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import {
  Tag,
  Field,
  FieldLabel,
  FieldHint,
  FieldError,
  Flex,
} from '@strapi/design-system'
import { Cross } from '@strapi/icons'
import { ReactSelect } from '@strapi/helper-plugin'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import getTrad from '../../utils/getTrad'

const CustomMultiValueContainer = (props) => {
  const { selectProps } = props
  const handleTagClick = (value) => (e) => {
    e.preventDefault()
    selectProps.onChange(selectProps.value.filter((v) => v !== value))
  }
  return (
    <Tag
      type="button"
      tabIndex={-1}
      icon={<Cross />}
      onClick={handleTagClick(props.data)}>
      {props.data.label}
    </Tag>
  )
}

const StyleSelect = styled(ReactSelect)`
  .select-control {
    height: auto;

    & > div:first-child {
      padding: 4px;
      gap: 4px;

      & > div {
        padding-left: 8px;
      }
    }

    .select-multi-value-container {
      margin-right: -8px;
    }
  }
  .option-disabled {
    opacity: 0.5;
    pointer-events: none;
  }
`

const CountriesSelect = ({
  value,
  onChange,
  name,
  intlLabel,
  required,
  attribute,
  description,
  placeholder,
  disabled,
  error,
}) => {
  const [allIsSelected, setAllIsSelected] = useState(false)

  const { formatMessage, messages } = useIntl()
  console.log('messages', JSON.parse(value || '[]'))
  const parsedOptions = JSON.parse(messages[getTrad('countries')])

  const possibleOptions = useMemo(() => {
    return [
      ...(attribute['options-extra'] || [])
        .map((option) => {
          const [value, label] = [...option.split(':'), option]
          if (!label || !value) return null
          return { label, value, disabled: allIsSelected }
        })
        .filter(Boolean),
      {
        label: 'All',
        value: 'ALL',
      },
      ...Object.entries(parsedOptions).map(([value, label]) => ({
        label,
        value,
        disabled: allIsSelected,
      })),
    ]
  }, [allIsSelected, attribute])

  const sanitizedValue = useMemo(() => {
    let parsedValue
    try {
      parsedValue = JSON.parse(value || '[]')
    } catch (e) {
      parsedValue = []
    }
    return Array.isArray(parsedValue)
      ? possibleOptions.filter((option) =>
          parsedValue.some((val) => option.value === val),
        )
      : []
  }, [value, possibleOptions])

  const handleChange = (val) => {
    console.log('val', val)
    onChange({
      target: {
        name: name,
        value:
          val?.length && val.filter((v) => !!v).length
            ? JSON.stringify(val.filter((v) => !!v).map((v) => v.value))
            : null,
        type: attribute.type,
      },
    })
  }

  useEffect(() => {
    value.indexOf('ALL') !== -1
      ? setAllIsSelected(true)
      : setAllIsSelected(false)
  }, [value])

  useEffect(() => {
    if (
      JSON.stringify(JSON.parse(value || '[]')) !==
      JSON.stringify(sanitizedValue)
    ) {
      handleChange(sanitizedValue)
    }
  }, [sanitizedValue])

  const fieldError = useMemo(() => {
    return error || (required && !possibleOptions.length ? 'No options' : null)
  }, [required, error, possibleOptions])

  return (
    <Field
      hint={description && formatMessage(description)}
      error={fieldError}
      name={name}
      required={required}>
      <Flex direction="column" alignItems="stretch" gap={1}>
        <FieldLabel>{formatMessage(intlLabel)}</FieldLabel>
        <StyleSelect
          isSearchable
          isMulti
          error={fieldError}
          name={name}
          id={name}
          disabled={disabled || possibleOptions.length === 0}
          placeholder={placeholder}
          defaultValue={sanitizedValue}
          value={sanitizedValue}
          components={{
            MultiValueContainer: CustomMultiValueContainer,
          }}
          options={possibleOptions}
          isOptionDisabled={(option) => option.disabled}
          onChange={(val) => {
            if (val.find((v) => v.value === 'ALL')) {
              return handleChange([{ label: 'All', value: 'ALL' }])
            }
            handleChange(val.filter(Boolean))
          }}
          classNames={{
            control: (_state) => 'select-control',
            multiValue: (_state) => 'select-multi-value',
            placeholder: (_state) => 'select-placeholder',
            option: ({ isDisabled }) => (isDisabled ? 'option-disabled' : ''),
          }}
        />
        <FieldHint />
        <FieldError />
      </Flex>
    </Field>
  )
}

CountriesSelect.defaultProps = {
  description: null,
  disabled: false,
  error: null,
  labelAction: null,
  required: false,
  value: '',
}

CountriesSelect.propTypes = {
  intlLabel: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  attribute: PropTypes.object.isRequired,
  name: PropTypes.string.isRequired,
  description: PropTypes.object,
  disabled: PropTypes.bool,
  error: PropTypes.string,
  labelAction: PropTypes.object,
  required: PropTypes.bool,
  value: PropTypes.string,
}

export default CountriesSelect
