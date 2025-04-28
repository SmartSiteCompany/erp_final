import React from 'react';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container-fluid">
        <div className="row">
          <div className="col-sm-6">
            {currentYear} © Smart Site Company.
          </div>
         {/* <div className="col-sm-6">
            <div className="text-sm-end d-none d-sm-block">
               <i className="mdi mdi-heart text-danger"></i> {' '}
              <a
                href="https://themesbrand.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-reset"
              >
              </a>
            </div>
          </div>*/}
        </div>
      </div>
    </footer>
  );
}

export default Footer;