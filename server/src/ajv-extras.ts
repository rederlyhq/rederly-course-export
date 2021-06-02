// Eventually we might want to use our own ajv instance and when we do that we should have the rest of the types we need
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * This file is an adaptation of some of our ajv logic from our validations library for the backend
 * Some of it does not translate since ajv versions are different
 * Since some types were not available I used any instead
 */

const TSTypeConversion = {
    // Allow date to throw the error, it will be caught in the validation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Date: (value: any): Date => {
        const date: Date = new Date(value);
        if (isNaN(date.getTime())) {
            throw new Error(`Could not parse date [${value}]`);
        }
        return date;
    },
    unknown: null
};


const addErrorToValidateFunc = ({validateFunc, errMessage}: any) => {
    validateFunc.errors = [...(validateFunc.errors ?? []), {
        message: errMessage
        // Couldn't find a reference to this, however schemaPath which is injected ends in /tsType
        // keyword: 'tsType', 
        // Don't know how to set, on intentional errors this is empty object
        // params: {},
        // This is injected by ajv
        // dataPath: dataPath,
        // This is injected by ajv
        // schemaPath: 'TODO',
}];

};
const boolValidateFunc = (val: boolean, error?: string): any => function validateFunction() {
    if (error !== undefined) {
        addErrorToValidateFunc({
            validateFunc: validateFunction as any,
            errMessage: error
        });
    }
    return val;
};

// in index.d.ts ValidateFunction is defined to have this of Ajv | any
// schema is string since this is attached to strings
export function tsTypeKeywordCompileFunc (this: any, schema: string): any {
    const coerceTypes = Boolean(this?._opts?.coerceTypes);
    if (!coerceTypes) {
        return boolValidateFunc(true);
    }

    if (!(schema in TSTypeConversion)) {
        return boolValidateFunc(false, `Rederly AJV: specified schema [${schema}] cannot be coerced to TSType`);
    }

    const validateFunction: any = function (
        // data can be any but we specified that that this function is on type string
        data: string,
        path: string,
        parentData: any,
        parentDataProperty: any,
    ): boolean {
        if (!parentData || !parentDataProperty) {
            addErrorToValidateFunc({
                validateFunc: validateFunction,
                errMessage: 'Rederly AJV: info was not provided to validate function'
            });
            return false;
        }

        if (schema in TSTypeConversion) {
            try {
                const conversionFunction = TSTypeConversion[schema as keyof typeof TSTypeConversion];
                if (conversionFunction) {
                    const date = conversionFunction(data);
                    if (parentData) {
                        parentData[parentDataProperty] = date;
                    } else {
                        // TODO
                        // This shouldn't happen anyway
                        // eslint-disable-next-line no-console
                        console.log('Rederly: Could not coerce - has no parent');
                    }    
                }
                return true;
            } catch(e) {
                addErrorToValidateFunc({
                    validateFunc: validateFunction,
                    errMessage: e.message
                });
                return false;
            }
        } else {
            // This should not happen: already checked above for optimization
            addErrorToValidateFunc({
                validateFunc: validateFunction,
                errMessage: `Rederly AJV: specified schema [${schema}] cannot be coerced to TSType`
            });
            return false;
        }
    };
    return validateFunction;
}
