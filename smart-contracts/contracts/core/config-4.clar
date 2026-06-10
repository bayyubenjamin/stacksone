;; Config updated 2026-06-10T06:36:03Z
(define-constant ERR-UNAUTHORIZED (err u401))
(define-data-var config-version uint u7)

(define-read-only (get-config-version)
  (ok (var-get config-version))
)
