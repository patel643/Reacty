import PropTypes from 'prop-types';
import React from 'react';
import autoBind from 'react-autobind';
import classNames from 'classnames';
import { debounce, inRange, isNil, omit } from 'lodash';

import Suggestions from './suggestions';

class SearchBar extends React.Component {
  constructor(props) {
    super(props);

    if (props.renderSearchButton && !props.onSearch) {
      throw new Error('onSearch is required when rendering search button');
    }

    this.state = {
      focusedSuggestion: null,
      isFocused: false,
      searchTerm: '',
      value: ''
    };

    autoBind(this);

    this.handleDebouncedChange = debounce(
      this.handleDebouncedChange,
      props.delay
    );
  }

  componentDidMount() {
    if (this.props.autoFocus) {
      this.input.focus();
    }

    document.addEventListener('click', this.handleClick);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleClick);
  }

  setFocusedSuggestion(movingDown) {
    const { focusedSuggestion: index, searchTerm } = this.state;
    const { suggestions } = this.props;
    const last = suggestions.length - 1;

    let next;

    if (movingDown) {
      next = isNil(index) ? 0 : index + 1;
    } else {
      next = isNil(index) ? last : index - 1;
    }

    this.setState({
      focusedSuggestion: inRange(next, 0, suggestions.length) ? next : null,
      value: suggestions[next] || searchTerm
    });
  }

  clearSearch() {
    this.setState({
      focusedSuggestion: null,
      searchTerm: '',
      value: ''
    });

    this.input.focus();
    this.props.onClear();
  }

  toggleFocus() {
    this.setState({
      isFocused: !this.state.isFocused
    });
  }



  handleDebouncedChange(searchTerm) {
    this.setState({
      searchTerm
    });

    this.props.onChange(searchTerm);
  }

  handleChange(event) {
    const { value } = event.target;
    const searchTerm = value.toLowerCase().trim();

    if (!value) {
      this.clearSearch();
      return;
    }

    this.setState({
      focusedSuggestion: null,
      value
    });

    if (searchTerm) {
      this.handleDebouncedChange(searchTerm);
    }
  }

  handleKeyDown(event) {
    switch (event.key) {
      case 'ArrowUp':
      case 'ArrowDown':
        event.preventDefault();
        this.setFocusedSuggestion(event.key === 'ArrowDown');
        break;

      case 'Backspace':
        this.handleBackspace();
        break;

      case 'Enter':
        this.handleSearch();
        break;

      case 'Escape':
        this.handleEscape();
        break;
    }
  }

  handleBackspace() {
    this.setState({
      focusedSuggestion: null
    });
  }

  handleSearch() {
    this.props.onClear();
    this.props.onSearch(this.state.value.trim());
  }

  handleEscape() {
    this.setState({
      focusedSuggestion: null,
      searchTerm: ''
    });

    this.input.blur();
    this.props.onClear();
  }

  handleHover(index) {
    this.setState({
      focusedSuggestion: index
    });
  }

  handleSelection(suggestion) {
    this.setState({
      focusedSuggestion: null,
      value: suggestion
    });

    this.props.onClear();

    if (this.props.onSelection) {
      this.props.onSelection(suggestion);
    }
  }

  render() {
    const { props, state } = this;
    const { renderSearchButton, styles } = props;
    const attributes = omit(props, Object.keys(SearchBar.propTypes));

    const renderClearButton = state.value && props.renderClearButton;
    const renderSuggestions = state.value && props.suggestions.length > 0;

    return (
      <div class="columns">
      <div
        className={styles.wrapper}
        ref={ref => this.container = ref}
      >
        <div
          className={classNames({
            [styles.field]: true,
            [styles.fieldFocused]: state.isFocused,
            [styles.hasSuggestions]: props.suggestions.length > 0
          })}
        >
        <div class="field has-addons">
        <div class="control is-expanded">
          <input
            {...attributes}
            class="input"
            type="text"
            ref={ref => this.input = ref}
            value={state.value}
            onChange={this.handleChange}
            onFocus={this.toggleFocus}
            onBlur={this.toggleFocus}
            onKeyDown={props.suggestions && this.handleKeyDown}
          />

          <strong>{renderClearButton }</strong></div>
          <div class="control">
          {renderSearchButton && (
            <button class="button"

              onClick={this.handleSearch}
            >Search</button>
          )}
          </div>
          </div>
        </div>
        {renderSuggestions && (
          <Suggestions
            focusedSuggestion={state.focusedSuggestion}
            onSelection={this.handleSelection}
            onSuggestionHover={this.handleHover}
            searchTerm={state.searchTerm}
            styles={styles}
            suggestions={props.suggestions}
            suggestionRenderer={props.suggestionRenderer}
          />
        )}
      </div>
</div>
    );
  }
}

SearchBar.propTypes = {
  autoFocus: PropTypes.bool,
  delay: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string
  ]),
  onClear: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  onSearch: PropTypes.func,
  onSelection: PropTypes.func,
  renderClearButton: PropTypes.bool,
  renderSearchButton: PropTypes.bool,
  styles: PropTypes.object,
  suggestions: PropTypes.array.isRequired,
  suggestionRenderer: PropTypes.func
};

SearchBar.defaultProps = {
  autoCapitalize: 'off',
  autoComplete: 'off',
  autoCorrect: 'off',
  autoFocus: false,
  delay: 0,
  maxLength: 100,
  placeholder: '',
  renderClearButton: false,
  renderSearchButton: false,
  styles: {
    wrapper: 'module-3-group-assignment-wonderdevils__wrapper',
    field: 'module-3-group-assignment-wonderdevils__field',
    focusedField: 'module-3-group-assignment-wonderdevils__field--focused',
    hasSuggestions: 'module-3-group-assignment-wonderdevils__field--has-suggestions',
    input: 'module-3-group-assignment-wonderdevils__input',
    clearButton: 'module-3-group-assignment-wonderdevils__clear',
    submitButton: 'module-3-group-assignment-wonderdevils__submit',
    suggestions: 'module-3-group-assignment-wonderdevils__suggestions',
    suggestion: 'module-3-group-assignment-wonderdevils__suggestion'
  },
  suggestionRenderer: suggestion => <div>{suggestion}</div>
};

export default SearchBar;
