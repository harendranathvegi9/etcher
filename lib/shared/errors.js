/*
 * Copyright 2016 resin.io
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const _ = require('lodash');

/**
 * @summary Human-friendly error messages
 * @namespace HUMAN_FRIENDLY
 * @public
 */
exports.HUMAN_FRIENDLY = {

  /* eslint-disable new-cap */

  /**
   * @namespace ENOENT
   * @memberof HUMAN_FRIENDLY
   */
  ENOENT: {

    /**
     * @property {Function} title
     * @memberof ENOENT
     * @param {Error} error - error object
     * @returns {String} message
     */
    title: (error) => {
      return `No such file or directory: ${error.path}`;
    },

    /**
     * @property {Function} description
     * @memberof ENOENT
     * @param {Error} error - error object
     * @returns {String} message
     */
    description: _.constant('The file you\'re trying to access doesn\'t exist')

  },

  /**
   * @namespace EPERM
   * @memberof HUMAN_FRIENDLY
   */
  EPERM: {

    /**
     * @property {Function} title
     * @memberof EPERM
     * @param {Error} error - error object
     * @returns {String} message
     */
    title: _.constant('You\'re not authorized to perform this operation'),

    /**
     * @property {Function} description
     * @memberof EPERM
     * @param {Error} error - error object
     * @returns {String} message
     */
    description: _.constant('Please ensure you have to necessary permissions for this task')

  },

  /**
   * @namespace EACCES
   * @memberof HUMAN_FRIENDLY
   */
  EACCES: {

    /**
     * @property {Function} title
     * @memberof EACCES
     * @param {Error} error - error object
     * @returns {String} message
     */
    title: _.constant('You don\'t have access to this resource'),

    /**
     * @property {Function} description
     * @memberof EACCES
     * @param {Error} error - error object
     * @returns {String} message
     */
    description: _.constant('Please ensure you have to necessary permissions for this task')

  },

  /**
   * @namespace ENOMEM
   * @memberof HUMAN_FRIENDLY
   */
  ENOMEM: {

    /**
     * @property {Function} title
     * @memberof ENOMEM
     * @param {Error} error - error object
     * @returns {String} message
     */
    title: _.constant('Your system ran out of memory'),

    /**
     * @property {Function} description
     * @memberof ENOMEM
     * @param {Error} error - error object
     * @returns {String} message
     */
    description: _.constant('Make sure your system has enough available memory for this task')

  }

  /* eslint-enable new-cap */

};

/**
 * @summary Get user friendly property from an error
 * @function
 * @private
 *
 * @param {Error} error - error
 * @param {String} property - HUMAN_FRIENDLY property
 * @returns {(String|Undefined)} user friendly message
 *
 * @example
 * const error = new Error('My error');
 * error.code = 'ENOMEM';
 *
 * const friendlyDescription = getUserFriendlyMessageProperty(error, 'description');
 *
 * if (friendlyDescription) {
 *   console.log(friendlyDescription);
 * }
 */
const getUserFriendlyMessageProperty = (error, property) => {
  const code = _.get(error, 'code');

  if (_.isNil(code) || !_.isString(code)) {
    return;
  }

  return _.invoke(exports.HUMAN_FRIENDLY, [ code, property ], error);
};

/**
 * @summary Check whether an error should be reported to TrackJS
 * @function
 * @public
 *
 * @description
 * In order to determine whether the error should be reported, we
 * check a property called `report`. For backwards compatibility, and
 * to properly handle errors that we don't control, an error without
 * this property is reported automatically.
 *
 * @param {Error} error - error
 * @returns {Boolean} whether the error should be reported
 *
 * @example
 * if (errors.shouldReport(new Error('foo'))) {
 *   console.log('We should report this error');
 * }
 */
exports.shouldReport = (error) => {
  return !_.has(error, 'report') || Boolean(error.report);
};

/**
 * @summary Check if a string is blank
 * @function
 * @private
 *
 * @param {String} string - string
 * @returns {Boolean} whether the string is blank
 *
 * @example
 * if (isBlank('   ')) {
 *   console.log('The string is blank');
 * }
 */
const isBlank = _.flow([ _.trim, _.isEmpty ]);

/**
 * @summary Get the title of an error
 * @function
 * @public
 *
 * @description
 * Try to get as most information as possible about the error
 * rather than falling back to generic messages right away.
 *
 * @param {Error} error - error
 * @returns {String} error title
 *
 * @example
 * const error = new Error('Foo bar');
 * const title = errors.getTitle(error);
 * console.log(title);
 */
exports.getTitle = (error) => {
  if (!_.isError(error) && !_.isPlainObject(error) && !_.isNil(error)) {
    return _.toString(error);
  }

  const codeTitle = getUserFriendlyMessageProperty(error, 'title');
  if (!_.isNil(codeTitle)) {
    return codeTitle;
  }

  const message = _.get(error, 'message');
  if (!isBlank(message)) {
    return message;
  }

  const code = _.get(error, 'code');
  if (!_.isNil(code) && !isBlank(code)) {
    return `Error code: ${code}`;
  }

  return 'An error ocurred';
};

/**
 * @summary Get the description of an error
 * @function
 * @public
 *
 * @param {Error} error - error
 * @returns {String} error description
 *
 * @example
 * const error = new Error('Foo bar');
 * const description = errors.getDescription(error);
 * console.log(description);
 */
exports.getDescription = (error) => {
  if (!_.isError(error) && !_.isPlainObject(error)) {
    return '';
  }

  if (!isBlank(error.description)) {
    return error.description;
  }

  const codeDescription = getUserFriendlyMessageProperty(error, 'description');
  if (!_.isNil(codeDescription)) {
    return codeDescription;
  }

  if (error.stack) {
    return error.stack;
  }

  if (_.isEmpty(error)) {
    return '';
  }

  return JSON.stringify(error, null, 2);
};

/**
 * @summary Create an error
 * @function
 * @public
 *
 * @param {String} title - error title
 * @param {String} [description] - error description
 * @param {Object} [options] - options
 * @param {Boolean} [options.report] - report error
 * @returns {Error} error
 *
 * @example
 * const error = errors.createError('Foo', 'Bar');
 * throw error;
 */
exports.createError = (title, description, options = {}) => {
  if (isBlank(title)) {
    throw new Error(`Invalid error title: ${title}`);
  }

  const error = new Error(title);
  error.description = description;

  if (!_.isNil(options.report) && !options.report) {
    error.report = false;
  }

  return error;
};

/**
 * @summary Create a user error
 * @function
 * @public
 *
 * @param {String} title - error title
 * @param {String} [description] - error description
 * @returns {Error} user error
 *
 * @example
 * const error = errors.createUserError('Foo', 'Bar');
 * throw error;
 */
exports.createUserError = (title, description) => {
  return exports.createError(title, description, {
    report: false
  });
};

/**
 * @summary Convert an Error object to a JSON object
 * @function
 * @public
 *
 * @param {Error} error - error object
 * @returns {Object} json error
 *
 * @example
 * const error = errors.toJSON(new Error('foo'))
 *
 * console.log(error.message);
 * > 'foo'
 */
exports.toJSON = (error) => {
  return {
    message: error.message,
    description: error.description,
    stack: error.stack,
    report: error.report,
    code: error.code
  };
};

/**
 * @summary Convert a JSON object to an Error object
 * @function
 * @public
 *
 * @param {Error} json - json object
 * @returns {Object} error object
 *
 * @example
 * const error = errors.fromJSON(errors.toJSON(new Error('foo')));
 *
 * console.log(error.message);
 * > 'foo'
 */
exports.fromJSON = (json) => {
  return _.assign(new Error(json.message), json);
};
