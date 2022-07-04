import * as _ from 'lodash-es';
import * as React from 'react';
import classNames from 'classnames';
import * as PropTypes from 'prop-types';
import { CaretDownIcon } from '@patternfly/react-icons';

class DropdownMixin extends React.PureComponent {
  constructor(props) {
    super(props);
    this.listener = this._onWindowClick.bind(this);
    this.state = { active: !!props.active, selectedKey: props.selectedKey };
    this.toggle = this.toggle.bind(this);
    this.dropdownElement = React.createRef();
    this.dropdownList = React.createRef();
  }

  _onWindowClick(event) {
    if (!this.state.active) {
      return;
    }

    const { current } = this.dropdownElement;
    if (!current) {
      return;
    }

    if (event.target === current || (current && current.contains(event.target))) {
      return;
    }

    this.hide(event);
  }

  UNSAFE_componentWillReceiveProps({ selectedKey, items }) {
    if (selectedKey !== this.props.selectedKey) {
      const title = items[selectedKey] || this.props.title;
      this.setState({ selectedKey, title });
    }
  }

  componentWillUnmount() {
    window.removeEventListener('click', this.listener);
  }

  onClick_(selectedKey, e) {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent?.stopImmediatePropagation?.();

    const { items, actionItems, onChange, noSelection, title } = this.props;

    if (onChange) {
      onChange(selectedKey, e);
    }

    const newTitle = items[selectedKey];

    if (!actionItems || !_.some(actionItems, { actionKey: selectedKey })) {
      this.setState({
        selectedKey,
        title: noSelection ? title : newTitle,
      });
    }

    this.hide();
  }

  toggle(e) {
    e.preventDefault();

    if (this.props.disabled) {
      return;
    }

    if (this.state.active) {
      this.hide(e);
    } else {
      this.show(e);
    }
  }

  show() {
    /* If you're wondering why this isn't in componentDidMount, it's because
     * kebabs are dropdowns. A list of 200 pods would mean 200 global event
     * listeners. This is bad for performance. - ggreer
     */
    window.removeEventListener('click', this.listener);
    window.addEventListener('click', this.listener);
    this.setState({ active: true });
  }

  hide(e) {
    e && e.stopPropagation();
    window.removeEventListener('click', this.listener);
    this.setState({ active: false });
  }
}

class DropDownRowWithTranslation extends React.PureComponent {
  render() {
    const {
      itemKey,
      content,
      onclick,
      className,
      selected,
      hover,
      autocompleteFilter,
    } = this.props;

    let prefix;
    const contentString = _.isString(content) ? content : '';

    if (!autocompleteFilter) {
      //use pf4 markup if not using the autocomplete dropdown
      return (
        <li key={itemKey}>
          <button
            className="pf-c-dropdown__menu-item"
            id={`${itemKey}-link`}
            data-test-id="dropdown-menu"
            data-test-dropdown-menu={itemKey}
            onClick={(e) => onclick(itemKey, e)}
          >
            {content}
          </button>
        </li>
      );
    }

    let suffix;

    return (
      <li role="option" className={classNames(className)} key={itemKey}>
        {prefix}
        <a
          href="#"
          ref={this.link}
          id={`${itemKey}-link`}
          data-test="dropdown-menu-item-link"
          className={classNames('pf-c-dropdown__menu-item', {
            'next-to-bookmark': !!prefix,
            hover,
            focus: selected,
          })}
          onClick={(e) => onclick(itemKey, e)}
        >
          {content}
        </a>
        {suffix}
      </li>
    );
  }
}

const DropDownRow = DropDownRowWithTranslation;

class Dropdown_ extends DropdownMixin {
  constructor(props) {
    super(props);
    this.onClick = (...args) => this.onClick_(...args);

    this.state.items = props.items;
    this.state.title = props.noSelection
      ? props.title
      : _.get(props.items, props.selectedKey, props.title);

    this.onKeyDown = (e) => this.onKeyDown_(e);
    this.changeTextFilter = (e) => this.applyTextFilter_(e.target.value, this.props.items);
    const { shortCut } = this.props;

    this.globalKeyDown = (e) => {
      if (e.key === 'Escape' && this.state.active) {
        this.hide(e);
        return;
      }

      const { nodeName } = e.target;

      if (nodeName === 'INPUT' || nodeName === 'TEXTAREA') {
        return;
      }

      if (!shortCut || e.key !== shortCut) {
        return;
      }

      if (e.ctrlKey || e.altKey || e.metaKey || e.shiftKey) {
        return;
      }

      e.stopPropagation();
      e.preventDefault();
      this.show(e);
    };
  }

  componentDidMount() {
    if (this.props.shortCut) {
      window.addEventListener('keydown', this.globalKeyDown);
    }
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    window.removeEventListener('keydown', this.globalKeyDown);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    super.UNSAFE_componentWillReceiveProps(nextProps);
    const props = this.props;

    if (_.isEqual(nextProps.items, props.items) && nextProps.title === props.title) {
      return;
    }
    const title = nextProps.title || props.title;
    this.setState({ title });

    this.applyTextFilter_(this.state.autocompleteText, nextProps.items);
  }

  componentDidUpdate(prevProps, prevState) {
    if (!prevState.active && this.state.active && this.input) {
      // Clear any previous filter when reopening the dropdown.
      this.applyTextFilter_('', this.props.items);
    }
  }

  applyTextFilter_(autocompleteText, items) {
    const { autocompleteFilter } = this.props;
    if (autocompleteFilter && !_.isEmpty(autocompleteText)) {
      items = _.pickBy(items, (item, key) => autocompleteFilter(autocompleteText, item, key));
    }
    this.setState({ autocompleteText, items });
  }

  onKeyDown_(e) {
    const { key } = e;

    if (key !== 'ArrowDown' && key !== 'ArrowUp' && key !== 'Enter') {
      return;
    }

    const { keyboardHoverKey } = this.state;
    const { items } = this.props;

    if (key === 'Enter') {
      if (this.state.active && items[keyboardHoverKey]) {
        this.onClick(keyboardHoverKey, e);
      }
      return;
    }

    const keys = _.keys(items);

    let index = _.indexOf(keys, keyboardHoverKey);

    if (key === 'ArrowDown') {
      index += 1;
    } else {
      index -= 1;
    }

    // periodic boundaries
    if (index >= keys.length) {
      index = 0;
    }
    if (index < 0) {
      index = keys.length - 1;
    }

    const newKey = keys[index];
    this.setState({ keyboardHoverKey: newKey });
    e.stopPropagation();
  }

  renderActionItem() {
    const { actionItems } = this.props;
    if (actionItems) {
      const { selectedKey, keyboardHoverKey, noSelection } = this.props;
      return (
        <>
          {actionItems.map((ai) => (
            <DropDownRow
              className={classNames({ active: ai.actionKey === selectedKey && !noSelection })}
              key={`${ai.actionKey}-${ai.actionTitle}`}
              itemKey={ai.actionKey}
              content={ai.actionTitle}
              onclick={this.onClick}
              selected={ai.actionKey === selectedKey && !noSelection}
              hover={ai.actionKey === keyboardHoverKey}
            />
          ))}
          <li className="co-namespace-selector__divider">
            <div className="dropdown-menu__divider" />
          </li>
        </>
      );
    }
    return null;
  }

  render() {
    const { active, autocompleteText, selectedKey, items, title, keyboardHoverKey } = this.state;
    const {
      ariaLabel,
      autocompleteFilter,
      autocompletePlaceholder,
      className,
      buttonClassName,
      menuClassName,
      storageKey,
      dropDownClassName,
      titlePrefix,
      describedBy,
      disabled,
    } = this.props;
    const spacerBefore = this.props.spacerBefore || new Set();
    const headerBefore = this.props.headerBefore || {};
    const rows = [];

    const addItem = (key, content) => {
      const selected = key === selectedKey && !this.props.noSelection;
      const hover = key === keyboardHoverKey;
      const klass = classNames({ active: selected });
      if (spacerBefore.has(key)) {
        rows.push(
          <li key={`${key}-spacer`}>
            <div className="dropdown-menu__divider" />
          </li>,
        );
      }

      if (_.has(headerBefore, key)) {
        rows.push(
          <li key={`${key}-header`}>
            <div className="dropdown-menu__header">{headerBefore[key]}</div>
          </li>,
        );
      }
      rows.push(
        <DropDownRow
          className={klass}
          key={key}
          itemKey={key}
          content={content}
          onclick={this.onClick}
          selected={selected}
          hover={hover}
          autocompleteFilter={autocompleteFilter}
        />,
      );
    };

    _.each(items, (v, k) => addItem(k, v));
    //render PF4 dropdown markup if this is not the autocomplete filter
    if (autocompleteFilter) {
      return (
        <div className={className} ref={this.dropdownElement} style={this.props.style}>
          <div
            className={classNames(
              'pf-c-dropdown',
              { 'pf-m-expanded': this.state.active },
              dropDownClassName,
            )}
          >
            <button
              aria-label={ariaLabel}
              aria-haspopup="true"
              onClick={this.toggle}
              onKeyDown={this.onKeyDown}
              type="button"
              className={classNames('pf-c-dropdown__toggle', buttonClassName)}
              id={this.props.id}
              aria-describedby={describedBy}
              disabled={disabled}
              data-test={this.props.dataTest}
            >
              <div className="pf-c-dropdown__content-wrap">
                <span className="pf-c-dropdown__toggle-text">
                  {titlePrefix && `${titlePrefix}: `}
                  {title}
                </span>
                <CaretDownIcon className="pf-c-dropdown__toggle-icon" />
              </div>
            </button>
            {active && (
              <ul
                role="listbox"
                ref={this.dropdownList}
                className={classNames(
                  'dropdown-menu__autocomplete-filter',
                  'pf-c-dropdown__menu',
                  menuClassName,
                )}
              >
                {autocompleteFilter && (
                  <div className="dropdown-menu__filter">
                    <input
                      autoFocus
                      type="text"
                      ref={(input) => (this.input = input)}
                      onChange={this.changeTextFilter}
                      placeholder={autocompletePlaceholder}
                      value={autocompleteText || ''}
                      autoCapitalize="none"
                      onKeyDown={this.onKeyDown}
                      className="pf-c-form-control"
                      onClick={(e) => e.stopPropagation()}
                      data-test-id="dropdown-text-filter"
                    />
                  </div>
                )}
                {this.renderActionItem()}
                {rows}
              </ul>
            )}
          </div>
        </div>
      );
    }

    //pf4 markup
    return (
      <div className={className} ref={this.dropdownElement} style={this.props.style}>
        <div
          className={classNames(
            { 'pf-c-dropdown': true, 'pf-m-expanded': this.state.active },
            dropDownClassName,
          )}
        >
          <button
            aria-label={ariaLabel}
            aria-haspopup="true"
            aria-expanded={this.state.active}
            className={classNames('pf-c-dropdown__toggle', buttonClassName)}
            data-test-id="dropdown-button"
            onClick={this.toggle}
            onKeyDown={this.onKeyDown}
            type="button"
            id={this.props.id}
            data-test={this.props.dataTest}
            aria-describedby={describedBy}
            disabled={disabled}
          >
            <span className="pf-c-dropdown__toggle-text">
              {titlePrefix && `${titlePrefix}: `}
              {title}
            </span>
            <CaretDownIcon className="pf-c-dropdown__toggle-icon" />
          </button>
          {active && (
            <ul
              ref={this.dropdownList}
              className={classNames('pf-c-dropdown__menu', menuClassName)}
            >
              {rows}
            </ul>
          )}
        </div>
      </div>
    );
  }
}

export const Dropdown = (props) => {
  return (
    <Dropdown_ {...props} />
  );
};

Dropdown.displayName = 'Dropdown';

Dropdown.propTypes = {
  actionItems: PropTypes.arrayOf(
    PropTypes.shape({
      actionKey: PropTypes.string,
      actionTitle: PropTypes.string,
    }),
  ),
  autocompleteFilter: PropTypes.func,
  autocompletePlaceholder: PropTypes.string,
  className: PropTypes.string,
  dropDownClassName: PropTypes.string,
  headerBefore: PropTypes.objectOf(PropTypes.string),
  items: PropTypes.object.isRequired,
  menuClassName: PropTypes.string,
  buttonClassName: PropTypes.string,
  noSelection: PropTypes.bool,
  userSettingsPrefix: PropTypes.string,
  storageKey: PropTypes.string,
  spacerBefore: PropTypes.instanceOf(Set),
  textFilter: PropTypes.string,
  title: PropTypes.node,
  disabled: PropTypes.bool,
  id: PropTypes.string,
  onChange: PropTypes.func,
  selectedKey: PropTypes.string,
  titlePrefix: PropTypes.string,
  ariaLabel: PropTypes.string,
  name: PropTypes.string,
  autoSelect: PropTypes.bool,
  describedBy: PropTypes.string,
  required: PropTypes.bool,
  dataTest: PropTypes.string,
};
