import { useCallback, useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Link, useNavigate, useParams } from "react-router-dom"
import { BackButton } from "~/components/BackButton"
import "./index.css"
import { Button } from "~/components/Button"
import { Input } from "~/components/Input"
import { useId } from "~/hooks/useId"
import { setCurrentList } from "~/store/list"
import { deleteTask, fetchTasks, updateTask } from "~/store/task"

const EditTask = () => {
  const id = useId()

  const { listId, taskId } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [title, setTitle] = useState("")
  const [detail, setDetail] = useState("")
  const [done, setDone] = useState(false)
  const [limit, setLimit] = useState("")

  const [errorMessage, setErrorMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const task = useSelector((state) =>
    state.task.tasks?.find((task) => task.id === taskId),
  )

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDetail(task.detail)
      setDone(task.done)
      const d = new Date(task.limit)
      setLimit(
        new Date(d.getTime() - d.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16),
      )
    }
  }, [task])

  useEffect(() => {
    void dispatch(setCurrentList(listId))
    void dispatch(fetchTasks())
  }, [listId, dispatch])

  const toUTCString = useCallback((localStr) => {
    if (!localStr) return null
    const utcTime = new Date(localStr)
    return utcTime.toISOString()
  }, [])

  const onSubmit = useCallback(
    (event) => {
      event.preventDefault()

      setIsSubmitting(true)
      const payload = { id: taskId, title, detail, done }
      if (limit) {
        const utc = toUTCString(limit)
        if (utc) payload.limit = utc
      }

      void dispatch(updateTask(payload))
        .unwrap()
        .then(() => {
          navigate(`/lists/${listId}`)
        })
        .catch((err) => {
          setErrorMessage(err.message)
        })
        .finally(() => {
          setIsSubmitting(false)
        })
    },
    [
      title,
      taskId,
      listId,
      detail,
      limit,
      toUTCString,
      done,
      dispatch,
      navigate,
    ],
  )

  const handleDelete = useCallback(() => {
    if (!window.confirm("Are you sure you want to delete this task?")) {
      return
    }

    setIsSubmitting(true)

    void dispatch(deleteTask({ id: taskId }))
      .unwrap()
      .then(() => {
        navigate(`/`)
      })
      .catch((err) => {
        setErrorMessage(err.message)
      })
      .finally(() => {
        setIsSubmitting(false)
      })
  }, [taskId, dispatch, navigate])

  return (
    <main className="edit_list">
      <BackButton />
      <h2 className="edit_list__title">Edit List</h2>
      <p className="edit_list__error">{errorMessage}</p>
      <form className="edit_list__form" onSubmit={onSubmit}>
        <fieldset className="edit_list__form_field">
          <label htmlFor={`${id}-title`} className="edit_list__form_label">
            Title
          </label>
          <Input
            id={`${id}-title`}
            placeholder="Buy some milk"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </fieldset>
        <fieldset className="edit_list__form_field">
          <label htmlFor={`${id}-detail`} className="edit_list__form_label">
            Description
          </label>
          <textarea
            id={`${id}-detail`}
            className="app_input"
            placeholder="Blah blah blah"
            value={detail}
            onChange={(event) => setDetail(event.target.value)}
          />
        </fieldset>
        <fieldset className="edit_list__form_field">
          <label htmlFor={`${id}-done`} className="edit_list__form_label">
            Is Done
          </label>
          <div>
            <input
              id={`${id}-done`}
              type="checkbox"
              checked={done}
              onChange={(event) => setDone(event.target.checked)}
            />
          </div>
        </fieldset>
        <fieldset className="edit_list__form_field">
          <label htmlFor={`${id}-limit`} className="edit_list__form_label">
            Due Date
          </label>
          <input
            id={`${id}-limit`}
            className="app_input"
            type="datetime-local"
            value={limit}
            onChange={(event) => setLimit(event.target.value)}
          />
        </fieldset>
        <div className="edit_list__form_actions">
          <Link to="/" data-variant="secondary" className="app_button">
            Cancel
          </Link>
          <div className="edit_list__form_actions_spacer"></div>
          <Button
            type="button"
            className="app_button edit_list__form_actions_delete"
            disabled={isSubmitting}
            onClick={handleDelete}
          >
            Delete
          </Button>
          <Button disabled={isSubmitting}>Update</Button>
        </div>
      </form>
    </main>
  )
}

export default EditTask
