import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import Toolbar from "../../components/Toolbar/Toolbar";
import Sidebar from "../../components/Sidebar/Sidebar";
import CodeArea from "../../components/CodeArea/CodeArea";
import Console from "../../components/Console/Console";
import { FileOrFolder } from "../../interfaces/SidebarInterface";
import menuItems from "../../data/menuItems.json";
import useLineHandlers from "../../hooks/useLineHandler";
import EditorContext from "../../contexts/EditorContext";
import "./Editor.css";
import NewProjectPopup from "../../components/ProjectPopup/NewProjectPopup";
import { createProject, getProjectDetails } from "../../apis/project";
import OpenProjectPopup from "../../components/ProjectPopup/OpenProjectPopup";
import useWebSocket from "../../hooks/useWebSocket";

const Editor = () => {
  const [files, setFiles] = useState<FileOrFolder[]>([]);
  const [command, setCommand] = useState<string>("");
  const [activeProject, setActiveProject] = useState<string | null>(null);
  const [showNewProjectPopup, setShowNewProjectPopup] = useState(false);
  const [showOpenProjectPopup, setShowOpenProjectPopup] = useState(false);
  const { send } = useWebSocket("ws://localhost:8080", (data) => {
    if (data.type === "files" && data.files) {
      setFiles(data.files);
    }
  });
  const navigate = useNavigate();
  const { uuid: urlUuid } = useParams();

  const [
    lines,
    handleLineChange,
    handleLineEnter,
    handlePaste,
    handleBackspace,
    handleBackspaceHighlight,
    handleArrowUp,
    handleArrowDown,
    handleTab,
  ] = useLineHandlers([""]);

  const handleNewProject = async (projectName: string) => {
    try {
      const projectData = {
        projectName,
        owner: "65ff34d5cc86ce3e8187c738", // Replace with the actual owner ID
        collaborators: [], // Add collaborators if needed
        language: "javascript", // Replace with the desired language
      };
      const newProject = await createProject(projectData);
      setActiveProject(newProject._id);
      const projectDetails = await getProjectDetails(newProject._id);
      setFiles([projectDetails.rootFolder]);
      setShowNewProjectPopup(false);
      send({ type: "files", files: [projectDetails.rootFolder] });
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  const handleNewProjectClick = () => {
    console.log("New Project Clicked!!");
    setShowNewProjectPopup(true);
  };

  const handleNewProjectCancel = () => {
    setShowNewProjectPopup(false);
  };

  const handleOpenProject = async (projectId: string) => {
    try {
      const projectDetails = await getProjectDetails(projectId);
      setActiveProject(projectDetails._id);
      setFiles([projectDetails.rootFolder]);
      setShowOpenProjectPopup(false);
      send({ type: "files", files: [projectDetails.rootFolder] });
    } catch (error) {
      console.error("Error opening project:", error);
    }
  };

  const handleOpenProjectClick = () => {
    console.log("Open Project Clicked!!");
    setShowOpenProjectPopup(true);
  };

  const handleOpenProjectCancel = () => {
    setShowOpenProjectPopup(false);
  };

  useEffect(() => {
    let uuid = urlUuid;

    if (!uuid) {
      uuid = uuidv4();
      navigate(`/${uuid}`);
    }
  }, []);

  return (
    <EditorContext.Provider
      value={{
        files,
        setFiles,
        command,
        setCommand,
        lines,
        handleLineChange,
        handleLineEnter,
        handlePaste,
        handleBackspace,
        handleBackspaceHighlight,
        handleArrowUp,
        handleArrowDown,
        handleTab,
        activeProject,
      }}
    >
      <div>
        <Toolbar
          menus={menuItems}
          onNewProjectClick={handleNewProjectClick}
          onOpenProjectClick={handleOpenProjectClick}
        />
        <div className="editor-container">
          <Sidebar />
          <div className="code-console-container">
            <CodeArea />
            <Console />
          </div>
        </div>
        {showNewProjectPopup && (
          <NewProjectPopup
            onSubmit={handleNewProject}
            onCancel={handleNewProjectCancel}
          />
        )}
        {showOpenProjectPopup && (
          <OpenProjectPopup
            onSubmit={handleOpenProject}
            onCancel={handleOpenProjectCancel}
          />
        )}
      </div>
    </EditorContext.Provider>
  );
};

export default Editor;
