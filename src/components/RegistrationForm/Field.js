import React from 'react';

const Field = React.forwardRef(({label, name, children, type = 'text', ...props}, ref) => {
  const childProps = {id: name, name};
  if (ref) {
    childProps.ref = ref;
  }
  return (
    <div style={{marginBottom: '1rem'}}>
      <label htmlFor={name}>{label}</label>
      <div>
        {children ? (
          React.cloneElement(children, childProps)
        ) : (
          <input id={name} name={name} ref={ref} type={type} {...props} />
        )}
      </div>
    </div>
  );
});

export default Field;
