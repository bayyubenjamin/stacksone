;; Config updated 2026-06-09T13:34:37Z
(define-constant ERR-UNAUTHORIZED (err u401))
(define-data-var config-version uint u36)

(define-read-only (get-config-version)
  (ok (var-get config-version))
)
