/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, {useRef, useMemo, useState, useEffect} from 'react';
import Select from 'react-select';
import AsyncSelect from 'react-select/async';
import {useForm, Controller} from 'react-hook-form';
import {useQuery} from 'react-query';
import debounce from 'debounce-promise';

import {getJurisdictions, searchCompaniesByName, getCompany} from './api';
import Field from './Field';

const CompanySearchByName = ({jurisdiction, ...props}) => {
  const loadOptions = useMemo(() => {
    const searchByName = (name) =>
      searchCompaniesByName({jurisdiction, name}).then((results) =>
        results.map((result) => ({
          value: result,
          label: result.name,
        }))
      );

    return debounce(searchByName, 300, {trailing: true});
  }, [jurisdiction]);

  return <AsyncSelect cacheOptions loadOptions={loadOptions} {...props} key={jurisdiction} />;
};

function Step1({onComplete}) {
  const jurisdictionList = useQuery('jurisdictions', getJurisdictions, {
    refetchOnWindowFocus: false,
  });

  const {
    handleSubmit,
    register,
    control,
    errors,
    getValues,
    setValue,
    watch,
    formState: {isSubmitting, isSubmitted, isValid},
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      searchType: 'name',
    },
  });

  const {searchType, legalJurisdiction} = watch();
  const jurisdiction = legalJurisdiction?.value;

  useEffect(() => {
    setValue('company', null, true);
  }, [jurisdiction, setValue]);

  const onSubmit = async ({company, legalJurisdiction, ...values}) => {
    const jurisdiction = legalJurisdiction.value;
    const companyNumber = company ? company.value.companyNumber : values.companyNumber;
    const companyRecord = await getCompany({
      jurisdiction,
      number: companyNumber,
    });

    onComplete({
      ...values,
      jurisdiction,
      company: companyRecord,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <section>
        <h3>Register LEI <span role="img" aria-label="papyrus scroll">📜</span></h3>
                 
        <Field label="Legal Jurisdiction" name="legalJurisdiction" >
          <Controller
            as={
              <Select
                options={jurisdictionList.data || []}
                isLoading={jurisdictionList.isValidating}
              />
            }
            name="legalJurisdiction"
            rules={{required: true}}
            control={control}
            onChange={([selected]) => {
              return selected;
            }}
            defaultValue={null}
          />
        </Field>

        {jurisdiction && (
          <>
            <Field label="Find Company By" name="searchType">
              <select ref={register({required: true}, {defaultValue: 'name'})}>
                <option value="name">Name</option>
                <option value="number">Number</option>
              </select>
            </Field>

            {searchType === 'name' && (
              <Field name="company" label="Company Name">
                <Controller
                  as={<CompanySearchByName jurisdiction={jurisdiction} />}
                  rules={{required: true}}
                  control={control}
                  onChange={([selected]) => {
                    return selected;
                  }}
                />
              </Field>
            )}

            {searchType === 'number' && (
              <Field
                name="companyNumber"
                label="Company Number"
                ref={register({
                  required: true,
                })}
              />
            )}

            <section>
              <Field>
                <label htmlFor="isLevel2DataAvailable">
                  <div>
                    <input
                      type="checkbox"
                      id="isLevel2DataAvailable"
                      name="isLevel2DataAvailable"
                      ref={register}
                    />{' '}
                    This company is owned by another company (at least 50%)
                  </div>
                </label>
              </Field>
            </section>
          </>
        )}
      </section>

      {isValid && (
        <div>
          <button type="submit" disabled={isSubmitting}>
            Continue
          </button>
        </div>
      )}
    </form>
  );
}

export default Step1;
