import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Modal from 'react-modal';
import * as _ from 'lodash-es';
import {
  ActionGroup,
  AlertGroup,
  Button,
  Text,
  TextContent,
  TextVariants,
} from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';

const createModal: CreateModal = (getModalContainer) => {
  const modalContainer = document.getElementById('modal-container');
  const result = new Promise<void>((resolve) => {
    const closeModal = (e?: React.SyntheticEvent) => {
      if (e && e.stopPropagation) {
        e.stopPropagation();
      }
      ReactDOM.unmountComponentAtNode(modalContainer);
      resolve();
    };
    Modal.setAppElement(document.getElementById('app-content'));
    modalContainer && ReactDOM.render(getModalContainer(closeModal), modalContainer);
  });
  return { result };
};

export const createModalLauncher: CreateModalLauncher = (Component) => (props) => {
  const getModalContainer: GetModalContainer = (onClose) => {
    const _handleClose = (e: React.SyntheticEvent) => {
      onClose && onClose(e);
      props.close && props.close();
    };
    const _handleCancel = (e: React.SyntheticEvent) => {
      props.cancel && props.cancel();
      _handleClose(e);
    };

    return (
      <Modal
        isOpen={true}
        contentLabel={i18next.t('public~Modal')}
        onRequestClose={_handleClose}
        className="modal-dialog"
        overlayClassName="co-overlay"
        parentSelector={() => document.getElementById('modal-container')}
      >
        <Component {...props} cancel={_handleCancel} close={_handleClose} />
      </Modal>
    );
  };
  return createModal(getModalContainer);
};

export const ModalTitle: React.FC<ModalTitleProps> = ({ children, className = 'modal-header' }) => (
  <div className={className}>
    <TextContent>
      <Text component={TextVariants.h1} data-test-id="modal-title">
        {children}
      </Text>
    </TextContent>
  </div>
);

export const ModalBody: React.FC<ModalBodyProps> = ({ children }) => (
  <div className="modal-body">
    <div className="modal-body-content">{children}</div>
  </div>
);

export const ModalSubmitFooter: React.FC<ModalSubmitFooterProps> = ({ cancel, submitText }) => {
  const { t } = useTranslation();
  const onCancelClick = (e) => {
    e.stopPropagation();
    cancel(e);
  };

  return (
    <div className="co-m-btn-bar modal-footer">
      <AlertGroup
        isLiveRegion
        aria-live="polite"
        aria-atomic="false"
        aria-relevant="additions text"
      >
        <ActionGroup className="pf-c-form pf-c-form__actions--right pf-c-form__group--no-top-margin">
          <Button
            type="button"
            variant="secondary"
            data-test-id="modal-cancel-action"
            onClick={onCancelClick}
            aria-label={t('public~Cancel')}
          >
            {t('public~Cancel')}
          </Button>
          <Button type="submit" variant="primary" data-test="confirm-action" id="confirm-action">
            {submitText}
          </Button>
        </ActionGroup>
      </AlertGroup>
    </div>
  );
};

type GetModalContainer = (onClose: (e?: React.SyntheticEvent) => void) => React.ReactElement;

type CreateModal = (getModalContainer: GetModalContainer) => { result: Promise<any> };

export type ModalComponentProps = {
  cancel?: () => void;
  close?: () => void;
};

type ModalTitleProps = {
  children: React.ReactNode;
  className?: string;
};

type ModalBodyProps = {
  children: React.ReactNode;
  className?: string;
};

type ModalSubmitFooterProps = {
  cancel: (e: React.SyntheticEvent<any, Event>) => void;
  submitText: React.ReactNode;
};

type CreateModalLauncher = <P extends ModalComponentProps>(
  C: React.ComponentType<P>,
) => (props: P) => { result: Promise<{}> };
