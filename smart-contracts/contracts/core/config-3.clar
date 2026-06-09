;; Config updated 2026-06-09T07:55:31Z
(define-constant ERR-UNAUTHORIZED (err u401))
(define-data-var config-version uint u13)

(define-read-only (get-config-version)
  (ok (var-get config-version))
)
