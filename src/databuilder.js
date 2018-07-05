import faker from "faker/locale/en";

/*
  use case:
  const builder = build({
    entry: fake(x => x),
    other: sequence(x => x),
    new: compose({ entry, stuff, other } => ({ mystuff: stuff + 1 })),
    stuff: 13
  });

  const obj = builder();
  const obj = builder({ entry, other, new , stuff });
*/

const MOCK_DATA_TYPES = {
  FAKER: "faker",
  SEQUENCE: "sequence",
  COMPOSED: "composed",
  ONBUILD: "onbuild"
};

/*
  this is to generate referentially different objects.
  eg: coords: onBuild(() => ({ x: 1, y: 2}))
  we will get coords: { x: 1, y: 2} for every call of the builder
  but b1.coords !== b2.coords
*/
export const onBuild = fn => {
  return {
    fn,
    tag: MOCK_DATA_TYPES.ONBUILD
  };
};

/*
  faker function see: https://github.com/marak/Faker.js/
  eg: randomZipCode: fake(f => f.address.zipCode())
*/
export const fake = fn => {
  return {
    fn,
    tag: MOCK_DATA_TYPES.FAKER
  };
};

/*
  for incremental:
  eg: {
    key1: sequence(x => `Hi ${x}`),
    key2: sequence(x => `What ${x}`)
  }
  we'll get: {
    key1: "Hi 1",
    key2: "What 1"
  }
  on subsequent calls of the builder the value will be incremented
*/
export const sequence = fn => {
  return {
    fn,
    tag: MOCK_DATA_TYPES.SEQUENCE
  };
};

/*
  for entries that are composed based on others
  doesn't YET work with other composed values
  eg: {
    x: 1,
    y: fake(f => f.random.number),
    composedEntry: composed(({ x, y }) => x + y)
  }
*/
export const composed = fn => {
  return {
    fn,
    tag: MOCK_DATA_TYPES.COMPOSED
  };
};

const evalBuilders = (options, sqNumber) => {
  const values = Object.entries(options).reduce((agg, [key, value]) => {
    switch (value.tag || 0) {
      case MOCK_DATA_TYPES.FAKER:
        return { ...agg, [key]: value.fn(faker) };
      case MOCK_DATA_TYPES.ONBUILD:
        return { ...agg, [key]: value.fn() };
      /* for composed types we evaluate it later */
      case MOCK_DATA_TYPES.COMPOSED:
        return { ...agg, [key]: value };
      case MOCK_DATA_TYPES.SEQUENCE:
        return {
          ...agg,
          [key]: value.fn(sqNumber)
        };
      default:
        return {
          ...agg,
          [key]: value
        };
    }
  }, {});

  return values;
};

const evalComposedValues = initValues => {
  const values = Object.entries(initValues).reduce((agg, [key, value]) => {
    switch (value.tag || 0) {
      case MOCK_DATA_TYPES.COMPOSED:
        return { ...agg, [key]: value.fn(initValues) };
      default:
        return { ...agg, [key]: value };
    }
  }, {});

  return values;
};

export const builder = (options, sequenceStart) => {
  let sqNumber = sequenceStart || 1;

  return (optionOverrides = {}) => {
    const computedOptions = {
      ...options,
      ...optionOverrides
    };

    const baseValues = evalBuilders(computedOptions, sqNumber);

    sqNumber += 1;

    const composedValues = evalComposedValues(baseValues);

    return composedValues;
  };
};

export const generateObjects = (builderFn, count, additionalOptions = {}) =>
  Array.from({ length: count }).map(() => builderFn(additionalOptions));
