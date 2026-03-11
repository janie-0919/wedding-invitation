import React, { useState } from "react";
import { gaEvent } from '../utils/ga';

const AccordionItem = ({ title, accounts }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleOpen = () => {
        const nextState = !isOpen;
        setIsOpen(nextState);

        gaEvent('toggle_account_section', {
            event_label: title,
            state: nextState ? 'open' : 'close',
            locale: 'ko',
            page: '/',
        });
    };

    const copyToClipboard = (text, label) => {
        const tempInput = document.createElement('input');
        tempInput.value = text;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);

        gaEvent('copy_account_number', {
            event_label: label,
            value: text,
            locale: 'ko',
            page: '/',
        });

        alert('계좌번호가 복사되었습니다!');
    };

    return (
        <div className={`item ${isOpen ? 'open' : ''}`}>
      <div className="a-head" onClick={toggleOpen}>
        <b className={`color-${title.includes('신랑') ? 'blue' : 'point'}`}>{title}</b>
      </div>
      <div className="a-body">
        {accounts.map((account, index) => (
            <div className="a-item" key={index}>
            <div className="info">
              <div className="account">
                <span className="bank">{account.bank}</span>
                <span className="num">{account.num}</span>
              </div>
              <div className="name">{account.name}</div>
            </div>
            <div className="action">
              {account.payLink && (
                  <a
                      href={account.payLink}
                      rel="noreferrer"
                      target="_blank"
                      className="btn-kakao"
                      onClick={() =>
                          gaEvent('click_pay_link', {
                              event_label: `${account.name} - ${account.bank}`,
                              url: account.payLink,
                              locale: 'ko',
                              page: '/',
                          })
                      }
                  >
                  <i className="ico ico-kakao"></i>
                  <span>Pay</span>
                </a>
              )}
                <button
                    className="btn btn-secondary"
                    onClick={() =>
                        copyToClipboard(`${account.bank} ${account.num}`, account.name)
                    }
                >
                복사하기
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
    );
};

export default AccordionItem;