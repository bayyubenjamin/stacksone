;; Config updated 2026-06-11T15:13:14Z
(define-constant ERR-UNAUTHORIZED (err u401))
(define-data-var config-version uint u43)

(define-read-only (get-config-version)
  (ok (var-get config-version))
)
