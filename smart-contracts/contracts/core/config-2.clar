;; Config updated 2026-05-27T15:23:40Z
(define-constant ERR-UNAUTHORIZED (err u401))
(define-data-var config-version uint u18)

(define-read-only (get-config-version)
  (ok (var-get config-version))
)
